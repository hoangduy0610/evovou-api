
import { VoucherDenomination_CreateDto, VoucherDenomination_UpdateDto } from '@/dtos/VoucherDenomination_Dtos';
import { VoucherDenomination } from '@/entities';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MessageCode } from 'src/commons/MessageCode';
import { ApplicationException } from 'src/controllers/ExceptionController';
import { Repository } from 'typeorm';
import { VoucherService } from './VoucherService';

@Injectable()
export class VoucherDenominationService {
    constructor(
        @InjectRepository(VoucherDenomination) private readonly voucherDenominationRepository: Repository<VoucherDenomination>,
        @Inject() private voucherService: VoucherService,
    ) {
    }

    async findAll(): Promise<VoucherDenomination[]> {
        const voucherDenominations = await this.voucherDenominationRepository.find({
            withDeleted: false
        });
        return voucherDenominations;
    }

    async findOne(id: number): Promise<VoucherDenomination> {
        const voucherDenomination = await this.voucherDenominationRepository.findOne({
            where: { id: id },
            withDeleted: false
        });
        return voucherDenomination;
    }

    async create(dto: VoucherDenomination_CreateDto): Promise<VoucherDenomination> {
        const existingVoucherDenomination = await this.voucherDenominationRepository.findOne({ where: { value: dto.value }, withDeleted: false });
        if (existingVoucherDenomination) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, MessageCode.VOUCHER_DENOMINATION_EXIST);
        }

        const voucherDenomination = await this.voucherDenominationRepository.create({
            value: dto.value,
            name: dto.name,
        })

        try {
            const res = await this.voucherDenominationRepository.save(voucherDenomination);
            await this.voucherService.syncVoucherDenominations();
            return res;
        } catch (error) {
            throw new ApplicationException(HttpStatus.UNAUTHORIZED, MessageCode.VOUCHER_DENOMINATION_CREATE_ERROR);
        }
    }

    async update(id: number, dto: VoucherDenomination_UpdateDto): Promise<VoucherDenomination> {
        const voucherDenomination = await this.voucherDenominationRepository.findOne({ where: { id: id }, withDeleted: false });
        if (!voucherDenomination) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, MessageCode.VOUCHER_DENOMINATION_NOT_FOUND);
        }

        try {
            voucherDenomination.name = dto.name;
            voucherDenomination.value = dto.value;
            voucherDenomination.updatedAt = new Date();

            const res = await this.voucherDenominationRepository.save(voucherDenomination);
            await this.voucherService.syncVoucherDenominations();
            return res;
        } catch (error) {
            throw new ApplicationException(HttpStatus.UNAUTHORIZED, MessageCode.VOUCHER_DENOMINATION_UPDATE_ERROR);
        }
    }

    async delete(id: number): Promise<VoucherDenomination> {
        const voucherDenomination = await this.voucherDenominationRepository.findOne({ where: { id: id }, withDeleted: false });
        if (!voucherDenomination) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, MessageCode.VOUCHER_DENOMINATION_NOT_FOUND);
        }

        try {
            const res = await this.voucherDenominationRepository.softRemove(voucherDenomination);
            await this.voucherService.syncVoucherDenominations();
            return res;
        } catch (error) {
            throw new ApplicationException(HttpStatus.UNAUTHORIZED, MessageCode.VOUCHER_DENOMINATION_UPDATE_ERROR);
        }
    }
}