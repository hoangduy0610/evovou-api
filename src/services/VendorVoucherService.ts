
import { VendorVoucher_CreateDto, VendorVoucher_ExchangeDto, VendorVoucher_UpdateDto } from '@/dtos/VendorVoucher_Dtos';
import { User, Vendor, VendorVoucher, VendorVoucherDenomination } from '@/entities';
import { EnumVoucherStatus } from '@/enums/EnumVoucherStatus';
import { UserModal } from '@/models/User';
import { StringUtils } from '@/utils/StringUtils';
import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as moment from 'moment';
import { MessageCode } from 'src/commons/MessageCode';
import { ApplicationException } from 'src/controllers/ExceptionController';
import { Repository } from 'typeorm';

@Injectable()
export class VendorVoucherService {
    constructor(
        @InjectRepository(VendorVoucher) private readonly vendorVoucherRepository: Repository<VendorVoucher>,
        @InjectRepository(VendorVoucherDenomination) private readonly vendorVoucherDenominationRepository: Repository<VendorVoucherDenomination>,
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        @InjectRepository(Vendor) private readonly vendorRepository: Repository<Vendor>,
    ) {
    }

    async findAll(vendorId: number): Promise<VendorVoucher[]> {
        const vendorVouchers = await this.vendorVoucherRepository.find({
            where: { vendorId: vendorId },
            relations: ['vendor'],
            withDeleted: false
        });
        return vendorVouchers;
    }

    async findOne(vendorId: number, id: number): Promise<VendorVoucher> {
        const vendorVoucher = await this.vendorVoucherRepository.findOne({
            where: { id: id, vendorId: vendorId },
            relations: ['vendor'],
            withDeleted: false
        });
        return vendorVoucher;
    }

    async create(vendorId: number, dto: VendorVoucher_CreateDto): Promise<VendorVoucher> {
        const vendor = await this.vendorRepository.findOne({ where: { id: vendorId }, withDeleted: false });
        if (!vendor) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, MessageCode.VENDOR_NOT_FOUND);
        }

        const denomination = await this.vendorVoucherDenominationRepository.findOne({ where: { id: dto.denominationId, vendorId: vendorId }, withDeleted: false });
        if (!denomination) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, MessageCode.VENDOR_VOUCHER_DENOMINATION_NOT_FOUND);
        }

        const owner = await this.userRepository.findOne({ where: { id: dto.ownerId }, withDeleted: false });
        if (!owner) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, MessageCode.USER_NOT_FOUND);
        }

        const voucherCode = await StringUtils.randomGenerateString(16);

        const vendorVoucher = await this.vendorVoucherRepository.create({
            denominationId: dto.denominationId,
            ownerId: dto.ownerId,
            expiredAt: dto.expiredAt,
            status: EnumVoucherStatus.READY,
            code: voucherCode,
            vendorId: vendorId,
        })

        try {
            const res = await this.vendorVoucherRepository.save(vendorVoucher);
            return res;
        } catch (error) {
            throw new ApplicationException(HttpStatus.UNAUTHORIZED, MessageCode.VENDOR_VOUCHER_CREATE_ERROR);
        }
    }

    async update(vendorId: number, id: number, dto: VendorVoucher_UpdateDto): Promise<VendorVoucher> {
        const vendorVoucher = await this.vendorVoucherRepository.findOne({ where: { id: id, vendorId: vendorId }, withDeleted: false });
        if (!vendorVoucher) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, MessageCode.VENDOR_VOUCHER_NOT_FOUND);
        }

        if (vendorVoucher.status !== EnumVoucherStatus.READY) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, MessageCode.VENDOR_VOUCHER_NOT_READY);
        }

        if (dto.denominationId) {
            const denomination = await this.vendorVoucherDenominationRepository.findOne({ where: { id: dto.denominationId, vendorId: vendorId }, withDeleted: false });
            if (!denomination) {
                throw new ApplicationException(HttpStatus.BAD_REQUEST, MessageCode.VENDOR_VOUCHER_DENOMINATION_NOT_FOUND);
            }
            vendorVoucher.denominationId = dto.denominationId;
        }

        if (dto.ownerId) {
            const owner = await this.userRepository.findOne({ where: { id: dto.ownerId }, withDeleted: false });
            if (!owner) {
                throw new ApplicationException(HttpStatus.BAD_REQUEST, MessageCode.USER_NOT_FOUND);
            }
            vendorVoucher.ownerId = dto.ownerId;
        }

        if (dto.expiredAt) {
            vendorVoucher.expiredAt = dto.expiredAt;
        }
        vendorVoucher.updatedAt = new Date();

        try {
            const res = await this.vendorVoucherRepository.save(vendorVoucher);
            return res;
        } catch (error) {
            throw new ApplicationException(HttpStatus.UNAUTHORIZED, MessageCode.VENDOR_VOUCHER_UPDATE_ERROR);
        }
    }

    async delete(vendorId: number, id: number): Promise<VendorVoucher> {
        const vendorVoucher = await this.vendorVoucherRepository.findOne({ where: { id: id, vendorId: vendorId }, withDeleted: false });
        if (!vendorVoucher) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, MessageCode.VENDOR_VOUCHER_NOT_FOUND);
        }

        try {
            const res = await this.vendorVoucherRepository.softRemove(vendorVoucher);
            return res;
        } catch (error) {
            throw new ApplicationException(HttpStatus.UNAUTHORIZED, MessageCode.VENDOR_VOUCHER_UPDATE_ERROR);
        }
    }

    async exchange(user: UserModal, dto: VendorVoucher_ExchangeDto): Promise<VendorVoucher> {
        const userEntity = await this.userRepository.findOne({ where: { id: user.id }, withDeleted: false });
        if (!userEntity) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, MessageCode.USER_NOT_FOUND);
        }

        const VendorVoucherDenomination = await this.vendorVoucherDenominationRepository.findOne({ where: { id: dto.denominationId, vendorId: dto.vendorId }, withDeleted: false });
        if (!VendorVoucherDenomination) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, MessageCode.VENDOR_VOUCHER_DENOMINATION_NOT_FOUND);
        }

        if (userEntity.balance < VendorVoucherDenomination.value) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, MessageCode.USER_NOT_ENOUGH_BALANCE);
        }

        const voucherCode = await StringUtils.randomGenerateString(16);
        const vendorVoucher = await this.vendorVoucherRepository.create({
            denominationId: dto.denominationId,
            ownerId: userEntity.id,
            expiredAt: moment().add(60, 'days').toDate(),
            status: EnumVoucherStatus.READY,
            code: voucherCode,
            vendorId: dto.vendorId,
        });

        try {
            const res = await this.vendorVoucherRepository.save(vendorVoucher);
            userEntity.balance -= VendorVoucherDenomination.value;
            await this.userRepository.save(userEntity);
            return res;
        } catch (error) {
            throw new ApplicationException(HttpStatus.UNAUTHORIZED, MessageCode.VENDOR_VOUCHER_CREATE_ERROR);
        }
    }
}