import { VoucherController } from '@/controllers/VoucherController';
import { VoucherService } from '@/services/VoucherService';
import { Module } from '@nestjs/common';

@Module({
    imports: [
    ],
    controllers: [VoucherController],
    providers: [
        VoucherService,
    ],
})
export class VoucherModule { }