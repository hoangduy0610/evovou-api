
import { Vendor_CreateDto, Vendor_UpdateDto } from '@/dtos/Vendor_Dtos';
import { Vendor } from '@/entities';
import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MessageCode } from 'src/commons/MessageCode';
import { ApplicationException } from 'src/controllers/ExceptionController';
import { Repository } from 'typeorm';

@Injectable()
export class VendorService {
    constructor(
        @InjectRepository(Vendor) private readonly vendorRepository: Repository<Vendor>
    ) {
    }

    async findAll(): Promise<Vendor[]> {
        const vendors = await this.vendorRepository.find({
            withDeleted: false
        });
        return vendors;
    }

    async findOne(id: number): Promise<Vendor> {
        const vendor = await this.vendorRepository.findOne({
            where: { id: id },
            withDeleted: false
        });
        return vendor;
    }

    async create(dto: Vendor_CreateDto): Promise<Vendor> {
        const vendor = await this.vendorRepository.create({
            name: dto.name,
            email: dto.email,
            description: dto.description,
            logo: dto.logo,
            website: dto.website,
            phone: dto.phone,
            address: dto.address,
            howToUse: dto.howToUse,
        })

        try {
            const res = await this.vendorRepository.save(vendor);
            return res;
        } catch (error) {
            throw new ApplicationException(HttpStatus.UNAUTHORIZED, MessageCode.VENDOR_CREATE_ERROR);
        }
    }

    async update(id: number, dto: Vendor_UpdateDto): Promise<Vendor> {
        const vendor = await this.vendorRepository.findOne({ where: { id: id }, withDeleted: false });
        if (!vendor) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, MessageCode.VENDOR_NOT_FOUND);
        }

        try {
            vendor.name = dto.name;
            vendor.email = dto.email;
            vendor.description = dto.description;
            vendor.logo = dto.logo;
            vendor.website = dto.website;
            vendor.phone = dto.phone;
            vendor.address = dto.address;
            vendor.howToUse = dto.howToUse;

            const res = await this.vendorRepository.save(vendor);
            return res;
        } catch (error) {
            throw new ApplicationException(HttpStatus.UNAUTHORIZED, MessageCode.VENDOR_UPDATE_ERROR);
        }
    }

    async delete(id: number): Promise<Vendor> {
        const vendor = await this.vendorRepository.findOne({ where: { id: id }, withDeleted: false });
        if (!vendor) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, MessageCode.VENDOR_NOT_FOUND);
        }

        try {
            const res = await this.vendorRepository.softRemove(vendor);
            return res;
        } catch (error) {
            throw new ApplicationException(HttpStatus.UNAUTHORIZED, MessageCode.VENDOR_UPDATE_ERROR);
        }
    }
}