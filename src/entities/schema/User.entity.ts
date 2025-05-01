
import { Column, Entity, OneToMany } from 'typeorm';
import { BaseUser } from '../base';
import { VendorVoucher } from './VendorVoucher.entity';
import { Voucher } from './Voucher.entity';

@Entity()
export class User extends BaseUser {
    @Column({ unique: true })
    walletAddress: string;

    @Column()
    balance: number;

    @OneToMany(() => Voucher, (voucher) => voucher.owner)
    vouchers: Voucher[];

    @OneToMany(() => VendorVoucher, (voucher) => voucher.owner)
    vendorVouchers: VendorVoucher[];
}
