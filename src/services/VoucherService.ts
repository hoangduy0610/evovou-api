import { Voucher_ResCommonVoucherDto } from '@/dtos/Voucher_Dtos';
import { VendorVoucher, Voucher } from '@/entities';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlockchainService } from './BlockchainService';

@Injectable()
export class VoucherService {
    constructor(
        @InjectRepository(Voucher) private readonly voucherRepository: Repository<Voucher>,
        @InjectRepository(VendorVoucher) private readonly vendorVoucherRepository: Repository<VendorVoucher>,
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
}