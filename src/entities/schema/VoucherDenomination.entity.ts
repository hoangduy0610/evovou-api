
import { Entity, OneToMany } from 'typeorm';
import { BaseDenomination } from '../base';
import { Voucher } from './Voucher.entity';
import { Order } from './Order.entity';

@Entity()
export class VoucherDenomination extends BaseDenomination {
    @OneToMany(() => Voucher, (voucher) => voucher.denomination)
    vouchers: Voucher[];

    @OneToMany(() => Order, (order) => order.denomination)
    orders: Order[];
}
