
import { Constant } from '@/commons/Constant';
import { VendorUser_CreateDto, VendorUser_UpdateDto } from '@/dtos/VendorUser_Dtos';
import { Vendor, VendorUser } from '@/entities';
import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MessageCode } from 'src/commons/MessageCode';
import { ApplicationException } from 'src/controllers/ExceptionController';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class VendorUserService {
    constructor(
        @InjectRepository(VendorUser) private readonly vendorUserRepository: Repository<VendorUser>,
        @InjectRepository(Vendor) private readonly vendorRepository: Repository<Vendor>
    ) {
    }

    async findAll(vendorId: number): Promise<VendorUser[]> {
        const vendorUsers = await this.vendorUserRepository.find({
            where: { vendorId: vendorId },
            relations: ['vendor'],
            withDeleted: false
        });
        return vendorUsers;
    }

    async findOne(vendorId: number, id: number): Promise<VendorUser> {
        const vendorUser = await this.vendorUserRepository.findOne({
            where: { id: id, vendorId: vendorId },
            relations: ['vendor'],
            withDeleted: false
        });
        return vendorUser;
    }

    async create(vendorId: number, dto: VendorUser_CreateDto): Promise<VendorUser> {
        const vendor = await this.vendorRepository.findOne({ where: { id: vendorId }, withDeleted: false });
        if (!vendor) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, MessageCode.VENDOR_NOT_FOUND);
        }

        const existingVendorUser = await this.vendorUserRepository.findOne({ where: { email: dto.email }, withDeleted: false });
        if (existingVendorUser) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, MessageCode.VENDOR_USER_EMAIL_EXIST);
        }

        const hash = bcrypt.hashSync(dto.password, Constant.BCRYPT_ROUND);
        const vendorUser = await this.vendorUserRepository.create({
            name: dto.name,
            password: hash,
            role: dto.role,
            email: dto.email,
            vendorId: vendorId,
        })

        try {
            const res = await this.vendorUserRepository.save(vendorUser);
            return res;
        } catch (error) {
            throw new ApplicationException(HttpStatus.UNAUTHORIZED, MessageCode.VENDOR_USER_CREATE_ERROR);
        }
    }

    async update(vendorId: number, id: number, dto: VendorUser_UpdateDto): Promise<VendorUser> {
        const vendorUser = await this.vendorUserRepository.findOne({ where: { id: id, vendorId: vendorId }, withDeleted: false });
        if (!vendorUser) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, MessageCode.VENDOR_USER_NOT_FOUND);
        }

        try {
            vendorUser.name = dto.name;
            vendorUser.role = dto.role;
            vendorUser.email = dto.email;
            vendorUser.avatar = dto.avatar;
            vendorUser.updatedAt = new Date();

            const res = await this.vendorUserRepository.save(vendorUser);
            return res;
        } catch (error) {
            throw new ApplicationException(HttpStatus.UNAUTHORIZED, MessageCode.VENDOR_USER_UPDATE_ERROR);
        }
    }

    async delete(vendorId: number, id: number): Promise<VendorUser> {
        const vendorUser = await this.vendorUserRepository.findOne({ where: { id: id, vendorId: vendorId }, withDeleted: false });
        if (!vendorUser) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, MessageCode.VENDOR_USER_NOT_FOUND);
        }

        try {
            const res = await this.vendorUserRepository.softRemove(vendorUser);
            return res;
        } catch (error) {
            throw new ApplicationException(HttpStatus.UNAUTHORIZED, MessageCode.VENDOR_USER_UPDATE_ERROR);
        }
    }
}