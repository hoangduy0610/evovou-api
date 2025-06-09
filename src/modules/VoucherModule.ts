import { VoucherController } from '@/controllers/VoucherController';
import { User, VendorVoucher, Voucher, VoucherDenomination } from '@/entities';
import { Order } from '@/entities/schema/Order.entity';
import { VoucherQueue } from '@/queues/VoucherQueue';
import { BlockchainService } from '@/services/BlockchainService';
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
            Order,
        ]),
        BullModule.registerQueue({
            name: 'voucher',
        })
    ],
    controllers: [VoucherController],
    providers: [
        VoucherService,
        VoucherQueue,
        BlockchainService,
    ],
})
export class VoucherModule { }