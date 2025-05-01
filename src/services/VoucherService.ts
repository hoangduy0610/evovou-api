
import { ApplicationException } from '@/controllers/ExceptionController';
import { User, Voucher, VoucherDenomination } from '@/entities';
import { EnumVoucherStatus } from '@/enums/EnumVoucherStatus';
import { roundToNearestValue } from '@/utils/NumberUtils';
import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
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
        @InjectRepository(VoucherDenomination) private readonly voucherDenominationRepository: Repository<VoucherDenomination>,
        @InjectRepository(User) private readonly userRepository: Repository<User>,
    ) {
        const contractAddress = "0x0B021C6d74F2572e09Ea9a626e58A7b288ed1587";
        const contractABI = [
            "event VoucherPurchased(address indexed buyer, uint256 indexed tokenId, uint256 amountETH, uint256 amountVND)",
            "event VoucherRedeemed(address indexed redeemer, uint256 indexed tokenId, uint256 amountETH, uint256 amountVND)",
            "event VoucherTransferred(uint256 tokenId, address from, address to)"
        ];

        this.provider = new ethers.WebSocketProvider("wss://holesky.infura.io/ws/v3/d54f5b27db13442fa898a2b0d0b412c5");
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
        const rounedVndValue = roundToNearestValue(amountVND, VoucherService.voucherValues);
        const numberTokenId = Number(tokenId);

        const voucherDenomination = await this.voucherDenominationRepository.findOne({
            where: { value: rounedVndValue },
            withDeleted: false
        });

        const voucher = await this.voucherRepository.create({
            denominationId: voucherDenomination.id,
            ownerId: buyer,
            tokenId: numberTokenId,
            status: EnumVoucherStatus.READY,
            expiredAt: moment().add(30, 'days').toDate(),
            redeemedAt: null,
        })

        await this.voucherRepository.save(voucher);
    }

    private async handleRedeemedVoucher(redeemer: string, tokenId: BigInt, amountETH: BigInt, amountVND: BigInt) {
        const voucher = await this.voucherRepository.findOne({
            where: { tokenId: Number(tokenId), ownerId: redeemer },
            relations: ["denomination"],
            withDeleted: false
        });

        if (!voucher) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, "Voucher not found or not owned by redeemer.");
        }

        const owner = await this.userRepository.findOne({
            where: { walletAddress: redeemer },
            withDeleted: false
        });

        if (!owner) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, "Owner not found.");
        }

        voucher.status = EnumVoucherStatus.REDEEMED;
        voucher.redeemedAt = new Date();

        owner.balance += voucher.denomination.value;

        await this.voucherRepository.save(voucher);
        await this.userRepository.save(owner);
    }

    private async handleTransferredVoucher(tokenId: BigInt, from: string, to: string) {
        const voucher = await this.voucherRepository.findOne({
            where: { tokenId: Number(tokenId), ownerId: from },
            withDeleted: false
        });

        if (!voucher) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, "Voucher not found or not owned by sender.");
        }

        voucher.ownerId = to;
        await this.voucherRepository.save(voucher);
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
}