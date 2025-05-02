
import { VendorVoucherDenomination_CreateDto, VendorVoucherDenomination_UpdateDto } from '@/dtos/VendorVoucherDenomination_Dtos';
import { Vendor, VendorVoucherDenomination } from '@/entities';
import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MessageCode } from 'src/commons/MessageCode';
import { ApplicationException } from 'src/controllers/ExceptionController';
import { Repository } from 'typeorm';

@Injectable()
export class VendorVoucherDenominationService {
    constructor(
        @InjectRepository(VendorVoucherDenomination) private readonly vendorVoucherDenominationRepository: Repository<VendorVoucherDenomination>,
        @InjectRepository(Vendor) private readonly vendorRepository: Repository<Vendor>
    ) {
    }

    async findAll(vendorId: number): Promise<VendorVoucherDenomination[]> {
        const vendorVoucherDenominations = await this.vendorVoucherDenominationRepository.find({
            where: { vendorId: vendorId },
            relations: ['vendor'],
            withDeleted: false
        });
        return vendorVoucherDenominations;
    }

    async findOne(vendorId: number, id: number): Promise<VendorVoucherDenomination> {
        const vendorVoucherDenomination = await this.vendorVoucherDenominationRepository.findOne({
            where: { id: id, vendorId: vendorId },
            relations: ['vendor'],
            withDeleted: false
        });
        return vendorVoucherDenomination;
    }

    async create(vendorId: number, dto: VendorVoucherDenomination_CreateDto): Promise<VendorVoucherDenomination> {
        const vendor = await this.vendorRepository.findOne({ where: { id: vendorId }, withDeleted: false });
        if (!vendor) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, MessageCode.VENDOR_NOT_FOUND);
        }

        const existingVendorVoucherDenomination = await this.vendorVoucherDenominationRepository.findOne({ where: { value: dto.value, vendorId: vendorId }, withDeleted: false });
        if (existingVendorVoucherDenomination) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, MessageCode.VENDOR_VOUCHER_DENOMINATION_EXIST);
        }

        const vendorVoucherDenomination = await this.vendorVoucherDenominationRepository.create({
            value: dto.value,
            name: dto.name,
        })

        try {
            const res = await this.vendorVoucherDenominationRepository.save(vendorVoucherDenomination);
            return res;
        } catch (error) {
            throw new ApplicationException(HttpStatus.UNAUTHORIZED, MessageCode.VENDOR_VOUCHER_DENOMINATION_CREATE_ERROR);
        }
    }

    async update(vendorId: number, id: number, dto: VendorVoucherDenomination_UpdateDto): Promise<VendorVoucherDenomination> {
        const vendorVoucherDenomination = await this.vendorVoucherDenominationRepository.findOne({ where: { id: id, vendorId: vendorId }, withDeleted: false });
        if (!vendorVoucherDenomination) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, MessageCode.VENDOR_VOUCHER_DENOMINATION_NOT_FOUND);
        }

        try {
            vendorVoucherDenomination.name = dto.name;
            vendorVoucherDenomination.value = dto.value;
            vendorVoucherDenomination.updatedAt = new Date();

            const res = await this.vendorVoucherDenominationRepository.save(vendorVoucherDenomination);
            return res;
        } catch (error) {
            throw new ApplicationException(HttpStatus.UNAUTHORIZED, MessageCode.VENDOR_VOUCHER_DENOMINATION_UPDATE_ERROR);
        }
    }

    async delete(vendorId: number, id: number): Promise<VendorVoucherDenomination> {
        const vendorVoucherDenomination = await this.vendorVoucherDenominationRepository.findOne({ where: { id: id, vendorId: vendorId }, withDeleted: false });
        if (!vendorVoucherDenomination) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, MessageCode.VENDOR_VOUCHER_DENOMINATION_NOT_FOUND);
        }

        try {
            const res = await this.vendorVoucherDenominationRepository.softRemove(vendorVoucherDenomination);
            return res;
        } catch (error) {
            throw new ApplicationException(HttpStatus.UNAUTHORIZED, MessageCode.VENDOR_VOUCHER_DENOMINATION_UPDATE_ERROR);
        }
    }
}