import { Constant, EEnvName } from '@/commons/Constant';
import { ApplicationException } from '@/controllers/ExceptionController';
import { User, VoucherDenomination } from '@/entities';
import { Order } from '@/entities/schema/Order.entity';
import { EnumOrderStatus } from '@/enums/EnumOrderStatus';
import { EnumPaymentMethod } from '@/enums/EnumPaymentMethod';
import { StringUtils } from '@/utils/StringUtils';
import { InjectQueue } from '@nestjs/bull';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Queue } from 'bull';
import { console } from 'inspector';
import * as moment from 'moment';
import { VnpayService } from 'nestjs-vnpay';
import { Repository } from 'typeorm';
import { InpOrderAlreadyConfirmed, IpnFailChecksum, IpnInvalidAmount, IpnOrderNotFound, IpnSuccess, IpnUnknownError, ProductCode, VerifyReturnUrl, VnpLocale, dateFormat } from 'vnpay';

@Injectable()
export class VNPayService {
    private readonly logger = new Logger(VNPayService.name);
    constructor(
        private readonly vnpayService: VnpayService,
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        @InjectRepository(Order) private readonly orderRepository: Repository<Order>,
        @InjectRepository(VoucherDenomination) private readonly voucherDenominationRepository: Repository<VoucherDenomination>,
        @InjectQueue('voucher') private voucherQueue: Queue,
    ) { }

    async createPaymentUrl(
        userId: number,
        ipAddr: string,
        denominationId: number,
        paymentMethod?: EnumPaymentMethod,
    ) {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            withDeleted: false
        });

        if (!user) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, 'User not found');
        }

        const denomination = await this.voucherDenominationRepository.findOne({
            where: { id: denominationId },
            withDeleted: false
        });

        if (!denomination) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, 'Invalid voucher denomination');
        }

        const amount = denomination.value; // VNPay expects amount in VND, so multiply by 100

        if (amount <= 0) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, 'Amount must be greater than 0');
        }

        const expiredAt = moment().add(7, 'hours').add(30, 'minutes').toDate();
        const randomTxnRef = StringUtils.randomGenerateString(16);

        const paymentUrl = this.vnpayService.buildPaymentUrl({
            vnp_Amount: amount,
            vnp_IpAddr: ipAddr,
            vnp_TxnRef: randomTxnRef,
            vnp_OrderInfo: `Mua Voucher EvoVou ${randomTxnRef}`,
            vnp_OrderType: ProductCode.Other,
            vnp_ReturnUrl: Constant.getEnv(EEnvName.VNPAY_RETURN_URL),
            vnp_Locale: VnpLocale.VN, // 'vn' hoặc 'en'
            vnp_CreateDate: dateFormat(new Date()), // tùy chọn, mặc định là thời gian hiện tại
            vnp_ExpireDate: dateFormat(expiredAt), // tùy chọn
            vnp_BankCode: paymentMethod,
        });

        const order = this.orderRepository.create({
            txnRef: randomTxnRef,
            denominationId: denomination.id,
            userId: user.id,
            status: EnumOrderStatus.PENDING,
            paymentUrl: paymentUrl,
            expiresAt: expiredAt,
        });

        await this.orderRepository.save(order);

        return paymentUrl;
    }

    async handleIPN(req, res) {
        try {
            console.log('IPN request received:', req.query);
            const verify: VerifyReturnUrl = await this.vnpayService.verifyIpnCall(req.query);
            if (!verify.isVerified) {
                this.logger.error(`IPN verification failed: ${JSON.stringify(req.query)}`);
                return res.json(IpnFailChecksum);
            }

            if (!verify.isSuccess) {
                this.logger.error(`IPN payment failed: ${JSON.stringify(req.query)}`);
                return res.json(IpnUnknownError);
            }

            // Tìm đơn hàng trong cơ sở dữ liệu
            const foundOrder = await this.orderRepository.findOne({
                where: { txnRef: verify.vnp_TxnRef },
                relations: ['denomination', 'user'],
                withDeleted: false
            });

            // Nếu không tìm thấy đơn hàng hoặc mã đơn hàng không khớp
            if (!foundOrder || verify.vnp_TxnRef !== foundOrder.txnRef) {
                this.logger.error(`Order not found or mismatch: ${verify.vnp_TxnRef}`);
                return res.json(IpnOrderNotFound);
            }

            // Nếu số tiền thanh toán không khớp
            if (verify.vnp_Amount !== foundOrder.denomination.value) {
                this.logger.error(`Invalid amount: expected ${foundOrder.denomination.value}, got ${verify.vnp_Amount}`);
                return res.json(IpnInvalidAmount);
            }

            // Nếu đơn hàng đã được xác nhận trước đó
            if (foundOrder.status === EnumOrderStatus.COMPLETED || foundOrder.status === EnumOrderStatus.CLAIMED_VOUCHER) {
                this.logger.warn(`Order already confirmed: ${foundOrder.txnRef}`);
                return res.json(InpOrderAlreadyConfirmed);
            }

            /**
             * Sau khi xác thực đơn hàng thành công,
             * bạn có thể cập nhật trạng thái đơn hàng trong cơ sở dữ liệu
             */
            foundOrder.status = EnumOrderStatus.COMPLETED;
            const user = await this.userRepository.findOne({
                where: { id: foundOrder.userId },
                withDeleted: false
            });

            if (!user) {
                this.logger.error(`User not found for order: ${foundOrder.txnRef}`);
                return res.json(IpnUnknownError);
            }

            this.logger.log(`Processing order: ${foundOrder.txnRef} for user: ${user.id}`);
            await this.voucherQueue.add('buy', {
                orderId: foundOrder.id,
                toWalletAddress: user.walletAddress,
                amountVnd: foundOrder.denomination.value,
            })
            this.logger.log(`Order ${foundOrder.txnRef} processed successfully for user: ${user.id}`);

            await this.orderRepository.save(foundOrder);

            // Sau đó cập nhật trạng thái trở lại cho VNPay để họ biết bạn đã xác nhận đơn hàng
            return res.json(IpnSuccess);
        } catch (error) {
            this.logger.error(`IPN handling error: ${error.message}`, error.stack);
            return res.json(IpnUnknownError);
        }
    }

    async verifyReturnUrl(req, res) {
        try {
            const verify = await this.vnpayService.verifyReturnUrl(req.query);
            if (!verify.isVerified) {
                return res.send('Data integrity verification failed');
            }
            if (!verify.isSuccess) {
                return res.send('Payment order failed');
            }

            const htmlFormat = `
            <h3>Payment Verification Successful</h3>
            <p>Transaction Reference: ${verify.vnp_TxnRef}</p>
            <p>Amount: ${parseInt(verify.vnp_Amount.toString()).toLocaleString("vi-VN")} VND</p>
            <p>Now you can return to the application.</p>
            <p>Please wait for the system to process your order.</p>
            `

            return res.send(htmlFormat);
        } catch (error) {
            return res.send('Invalid data');
        }
    }
}
