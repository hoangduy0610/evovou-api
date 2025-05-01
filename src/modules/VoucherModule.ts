import { VoucherController } from '@/controllers/VoucherController';
import { User, Voucher, VoucherDenomination } from '@/entities';
import { VoucherService } from '@/services/VoucherService';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Voucher,
            VoucherDenomination,
            User,
        ])
    ],
    controllers: [VoucherController],
    providers: [
        VoucherService,
    ],
})
export class VoucherModule { }