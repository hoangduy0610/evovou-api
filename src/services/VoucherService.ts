import { Voucher_ResCommonVoucherDto } from '@/dtos/Voucher_Dtos';
import { User, VendorVoucher, Voucher } from '@/entities';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlockchainService } from './BlockchainService';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { EnumVoucherStatus } from '@/enums/EnumVoucherStatus';

@Injectable()
export class VoucherService {
    constructor(
        @InjectRepository(Voucher) private readonly voucherRepository: Repository<Voucher>,
        @InjectRepository(VendorVoucher) private readonly vendorVoucherRepository: Repository<VendorVoucher>,
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        @InjectQueue('voucher') private voucherQueue: Queue,
    ) { }

    async getTokenUriJSON(amount: number) {
        return await BlockchainService.getMetadataJSON(amount);
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

    async redeemVoucher(voucherId: number, userId: number): Promise<Voucher_ResCommonVoucherDto> {
        const voucher = await this.voucherRepository.findOne({
            where: { id: voucherId, ownerId: userId },
            relations: ["denomination", "owner"],
            withDeleted: false
        });

        if (!voucher) {
            throw new NotFoundException(`Voucher with ID ${voucherId} not found or does not belong to user with ID ${userId}`);
        }

        const owner = await this.userRepository.findOne({
            where: { id: voucher.ownerId },
            withDeleted: false
        });

        if (!owner) {
            throw new NotFoundException(`User with ID ${userId} not found`);
        }

        voucher.status = EnumVoucherStatus.REDEEMED;
        voucher.redeemedAt = new Date();

        owner.balance += voucher.denomination.value;

        await this.userRepository.save(owner);
        await this.voucherQueue.add('redeem', { tokenId: voucher.tokenId });

        return await this.voucherRepository.save(voucher);
    }

    async transferVoucher(voucherId: number, userId: number, receiverId: number): Promise<Voucher_ResCommonVoucherDto> {
        const voucher = await this.voucherRepository.findOne({
            where: { id: voucherId, ownerId: userId },
            withDeleted: false
        });

        if (!voucher) {
            throw new NotFoundException(`Voucher with ID ${voucherId} not found or does not belong to user with ID ${userId}`);
        }

        const receiver = await this.userRepository.findOne({
            where: { id: receiverId },
            withDeleted: false
        });

        if (!receiver) {
            throw new NotFoundException(`Receiver with ID ${receiverId} not found`);
        }

        if (receiver.id === userId) {
            throw new BadRequestException(`Cannot transfer voucher to self`);
        }

        voucher.ownerId = receiver.id;

        await this.voucherRepository.save(voucher);

        await this.voucherQueue.add('transfer', {
            tokenId: voucher.tokenId,
            toWalletAddress: receiver.walletAddress
        });

        return voucher;
    }
}