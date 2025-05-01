import { VendorUserController } from '@/controllers/VendorUserController';
import { Vendor, VendorUser } from '@/entities';
import { VendorUserService } from '@/services/VendorUserService';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Vendor,
            VendorUser,
        ])
    ],
    controllers: [VendorUserController],
    providers: [
        VendorUserService,
    ],
})
export class VendorUserModule { }