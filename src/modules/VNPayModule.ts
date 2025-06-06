import { Constant, EEnvName } from '@/commons/Constant';
import { User, VoucherDenomination } from '@/entities';
import { Order } from '@/entities/schema/Order.entity';
import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VnpayModule } from 'nestjs-vnpay';
import { VNPayController } from 'src/controllers/VNPayController';
import { HashAlgorithm } from 'vnpay';
import { VNPayService } from '../services/VNPayService';

@Module({
    imports: [
        VnpayModule.register({
            tmnCode: Constant.getEnv(EEnvName.VNPAY_MERCHANT_ID),
            secureSecret: Constant.getEnv(EEnvName.VNPAY_SECRET_KEY),
            vnpayHost: 'https://sandbox.vnpayment.vn',

            // Cấu hình tùy chọn
            testMode: true,                // Chế độ test (ghi đè vnpayHost thành sandbox nếu là true)
            hashAlgorithm: HashAlgorithm.SHA512,       // Thuật toán mã hóa
            enableLog: true,               // Bật/tắt ghi log
        }),
        BullModule.registerQueue({
            name: 'voucher',
        }),
        TypeOrmModule.forFeature([
            User,
            Order,
            VoucherDenomination,
        ])
    ],
    controllers: [VNPayController],
    providers: [
        VNPayService,
    ],
})
export class VNPayModule { }