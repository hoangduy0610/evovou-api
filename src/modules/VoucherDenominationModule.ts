import { VoucherDenominationController } from '@/controllers/VoucherDenominationController';
import { User, Vendor, Voucher, VoucherDenomination } from '@/entities';
import { VoucherDenominationService } from '@/services/VoucherDenominationService';
import { VoucherService } from '@/services/VoucherService';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            VoucherDenomination,
            Voucher,
            User,
        ])
    ],
    controllers: [VoucherDenominationController],
    providers: [
        VoucherDenominationService,
        VoucherService,
    ],
})
export class VoucherDenominationModule { }