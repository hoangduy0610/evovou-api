import { VoucherController } from '@/controllers/VoucherController';
import { User, VendorVoucher, Voucher, VoucherDenomination } from '@/entities';
import { VoucherService } from '@/services/VoucherService';
import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Voucher,
            VendorVoucher,
            VoucherDenomination,
            User,
        ]),
        BullModule.registerQueue({
            name: 'voucher',
        })
    ],
    controllers: [VoucherController],
    providers: [
        VoucherService,
    ],
})
export class VoucherModule { }