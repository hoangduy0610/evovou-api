
import { Constant, EEnvName } from '@/commons/Constant';
import { Voucher_ResCommonVoucherDto } from '@/dtos/Voucher_Dtos';
import { User, VendorVoucher, Voucher, VoucherDenomination } from '@/entities';
import { EnumVoucherStatus } from '@/enums/EnumVoucherStatus';
import { roundToNearestValue } from '@/utils/NumberUtils';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ethers } from "ethers";
import * as moment from 'moment';
import { Repository } from 'typeorm';

@Injectable()
export class VoucherService implements OnModuleInit {
    static voucherValues: number[] = [];
    static canInitNFTListener = true;
    private contract: ethers.Contract;
    private provider: ethers.Provider;
    constructor(
        @InjectRepository(Voucher) private readonly voucherRepository: Repository<Voucher>,
        @InjectRepository(VendorVoucher) private readonly vendorVoucherRepository: Repository<VendorVoucher>,
        @InjectRepository(VoucherDenomination) private readonly voucherDenominationRepository: Repository<VoucherDenomination>,
        @InjectRepository(User) private readonly userRepository: Repository<User>,
    ) {
        const contractAddress = Constant.getEnv(EEnvName.NFT_CONTRACT_ADDRESS);
        const contractABI = [
            "event VoucherPurchased(address indexed buyer, uint256 indexed tokenId, uint256 amountETH, uint256 amountVND)",
            "event VoucherRedeemed(address indexed redeemer, uint256 indexed tokenId, uint256 amountETH, uint256 amountVND)",
            "event VoucherTransferred(uint256 tokenId, address from, address to)"
        ];

        this.provider = new ethers.WebSocketProvider(Constant.getEnv(EEnvName.WS_RPC_URL));
        this.contract = new ethers.Contract(contractAddress, contractABI, this.provider);
    }

    onModuleInit() {
        if (VoucherService.canInitNFTListener) {
            VoucherService.canInitNFTListener = false;
            setTimeout(() => {
                this.syncVoucherDenominations()
                    .then(() => {
                        Logger.log("NFT Event listener initialized.");
                    })
                    .catch((error) => {
                        Logger.error("Error initializing NFT event listener:", error);
                    });
            }, 1000)
        }
    }

    async syncVoucherDenominations() {
        const voucherDenominations = await this.voucherDenominationRepository.find({ withDeleted: false });
        VoucherService.voucherValues = voucherDenominations.map((denomination) => denomination.value);

        this.contract.removeAllListeners();
        this.contract.on("VoucherPurchased", (buyer, tokenId, amountETH, amountVND) => this.handlePurchasedVoucher(buyer, tokenId, amountETH, amountVND));
        this.contract.on("VoucherRedeemed", (redeemer, tokenId, amountETH, amountVND) => this.handleRedeemedVoucher(redeemer, tokenId, amountETH, amountVND));
        this.contract.on("VoucherTransferred", (tokenId, from, to) => this.handleTransferredVoucher(tokenId, from, to));
    }

    private async handlePurchasedVoucher(buyer: string, tokenId: BigInt, amountETH: BigInt, amountVND: BigInt) {
        try {
            const rounedVndValue = roundToNearestValue(amountVND, VoucherService.voucherValues);
            const numberTokenId = Number(tokenId);

            const voucherDenomination = await this.voucherDenominationRepository.findOne({
                where: { value: rounedVndValue },
                withDeleted: false
            });

            if (!voucherDenomination) {
                Logger.error(`Voucher denomination not found for value: ${rounedVndValue}`);
                return;
            }

            const buyerUser = await this.userRepository.findOne({
                where: { walletAddress: buyer },
                withDeleted: false
            });

            if (!buyerUser) {
                Logger.error(`Buyer not found for address: ${buyer}`);
                return;
            }


            const voucher = await this.voucherRepository.create({
                denominationId: voucherDenomination.id,
                ownerId: buyerUser.id,
                tokenId: numberTokenId,
                status: EnumVoucherStatus.READY,
                expiredAt: moment().add(30, 'days').toDate(),
                redeemedAt: null,
            })

            await this.voucherRepository.save(voucher);
        } catch (error) {
            Logger.error(`Error handling purchased voucher: ${error}`);
        }
    }

    private async handleRedeemedVoucher(redeemer: string, tokenId: BigInt, amountETH: BigInt, amountVND: BigInt) {
        try {
            const redeemerUser = await this.userRepository.findOne({
                where: { walletAddress: redeemer },
                withDeleted: false
            });

            if (!redeemerUser) {
                Logger.error(`Redeemer not found for address: ${redeemer}`);
                return;
            }

            const voucher = await this.voucherRepository.findOne({
                where: { tokenId: Number(tokenId), ownerId: redeemerUser.id },
                relations: ["denomination"],
                withDeleted: false
            });

            if (!voucher) {
                Logger.error(`Voucher not found or not owned by redeemer: ${redeemer}`);
                return;
            }

            const owner = await this.userRepository.findOne({
                where: { walletAddress: redeemer },
                withDeleted: false
            });

            if (!owner) {
                Logger.error(`Owner not found for address: ${redeemer}`);
                return;
            }

            voucher.status = EnumVoucherStatus.REDEEMED;
            voucher.redeemedAt = new Date();

            owner.balance += voucher.denomination.value;

            await this.voucherRepository.save(voucher);
            await this.userRepository.save(owner);
        } catch (error) {
            Logger.error(`Error handling redeemed voucher: ${error}`);
        }
    }

    private async handleTransferredVoucher(tokenId: BigInt, from: string, to: string) {
        try {
            const fromUser = await this.userRepository.findOne({
                where: { walletAddress: from },
                withDeleted: false
            });

            if (!fromUser) {
                Logger.error(`Sender not found for address: ${from}`);
                return;
            }

            const toUser = await this.userRepository.findOne({
                where: { walletAddress: to },
                withDeleted: false
            });

            if (!toUser) {
                Logger.error(`Receiver not found for address: ${to}`);
                return;
            }

            const voucher = await this.voucherRepository.findOne({
                where: { tokenId: Number(tokenId), ownerId: fromUser.id },
                withDeleted: false
            });

            if (!voucher) {
                Logger.error(`Voucher not found or not owned by sender: ${from}`);
                return;
            }

            voucher.ownerId = toUser.id;
            await this.voucherRepository.save(voucher);
        } catch (error) {
            Logger.error(`Error handling transferred voucher: ${error}`);
        }
    }

    async getTokenUriJSON(amount: number) {
        return {
            "name": "Evovou Voucher " + amount + " VND",
            "symbol": "EVOVOU",
            "description": "Evovou Voucher NFT with amount: " + amount + " VND",
            "image": "https://i.imgur.com/G9aajG5.png",
            "animation_url": "https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExZDNrcmdrbzhhZm41cnZjaWJxZzk3cXgzdDk2dmltcXdqcHQ2OTY1ZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/rPbVaGPnheoQ2dFkND/giphy.gif",
            "external_url": "https://evovou.store",
            "attributes": [
                {
                    "trait_type": "web",
                    "value": "yes"
                },
                {
                    "trait_type": "mobile",
                    "value": "yes"
                },
                {
                    "trait_type": "extension",
                    "value": "yes"
                }
            ],
            "properties": {
                "files": [
                    {
                        "uri": "https://i.imgur.com/G9aajG5.png",
                        "type": "image/png"
                    }
                ],
                "category": "image"
            }
        }
    }

    async listAllVouchers() {
        const vouchers = await this.voucherRepository.find({
            relations: ["denomination", "owner"],
            withDeleted: false
        });

        return vouchers;
    }

    async getMyVouchers(userId: number, brandId?: number): Promise<Voucher_ResCommonVoucherDto[]> {
        if (brandId) {
            const vendorVouchers = await this.vendorVoucherRepository.find({
                where: { vendorId: brandId, ownerId: userId },
                relations: ["denomination", "owner", "vendor"],
                withDeleted: false
            });

            return vendorVouchers;
        }

        const vouchers = await this.voucherRepository.find({
            where: { ownerId: userId },
            relations: ["denomination", "owner"],
            withDeleted: false
        });

        const vendorVouchers = await this.vendorVoucherRepository.find({
            where: { ownerId: userId },
            relations: ["denomination", "owner", "vendor"],
            withDeleted: false
        });

        return [...vouchers, ...vendorVouchers];
    }
}