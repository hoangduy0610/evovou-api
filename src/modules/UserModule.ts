import { User, Voucher, VoucherDenomination } from '@/entities';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from 'src/controllers/UserController';
import { UserService } from '../services/UserService';
import { VoucherService } from '@/services/VoucherService';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            User,
            Voucher,
            VoucherDenomination,
        ])
    ],
    controllers: [UserController],
    providers: [
        UserService,
        VoucherService,
    ],
})
export class UserModule { }