import { VoucherDenominationController } from '@/controllers/VoucherDenominationController';
import { User, VendorVoucher, Voucher, VoucherDenomination } from '@/entities';
import { Order } from '@/entities/schema/Order.entity';
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
            Order,
        ])
    ],
    controllers: [VoucherDenominationController],
    providers: [
        VoucherDenominationService,
        BlockchainService,
    ],
})
export class VoucherDenominationModule { }