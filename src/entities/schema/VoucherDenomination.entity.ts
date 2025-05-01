
import { Entity, OneToMany } from 'typeorm';
import { BaseDenomination } from '../base';
import { Voucher } from './Voucher.entity';

@Entity()
export class VoucherDenomination extends BaseDenomination {
    @OneToMany(() => Voucher, (voucher) => voucher.denomination)
    vouchers: Voucher[];
}
