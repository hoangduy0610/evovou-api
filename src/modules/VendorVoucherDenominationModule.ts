import { VendorVoucherDenominationController } from '@/controllers/VendorVoucherDenominationController';
import { Vendor, VendorVoucherDenomination } from '@/entities';
import { VendorVoucherDenominationService } from '@/services/VendorVoucherDenominationService';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Vendor,
            VendorVoucherDenomination,
        ])
    ],
    controllers: [VendorVoucherDenominationController],
    providers: [
        VendorVoucherDenominationService,
    ],
})
export class VendorVoucherDenominationModule { }