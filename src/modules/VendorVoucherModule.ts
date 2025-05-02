import { VendorVoucherController } from '@/controllers/VendorVoucherController';
import { User, Vendor, VendorVoucher, VendorVoucherDenomination } from '@/entities';
import { VendorVoucherService } from '@/services/VendorVoucherService';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            VendorVoucher,
            VendorVoucherDenomination,
            User,
            Vendor,
        ])
    ],
    controllers: [VendorVoucherController],
    providers: [
        VendorVoucherService,
    ],
})
export class VendorVoucherModule { }