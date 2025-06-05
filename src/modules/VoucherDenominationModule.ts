import { VoucherDenominationController } from '@/controllers/VoucherDenominationController';
import { User, VendorVoucher, Voucher, VoucherDenomination } from '@/entities';
import { BlockchainService } from '@/services/BlockchainService';
import { VoucherDenominationService } from '@/services/VoucherDenominationService';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            VendorVoucher,
            VoucherDenomination,
            Voucher,
            User,
        ])
    ],
    controllers: [VoucherDenominationController],
    providers: [
        VoucherDenominationService,
        BlockchainService,
    ],
})
export class VoucherDenominationModule { }