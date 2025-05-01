
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseDenomination } from '../base';
import { Vendor } from './Vendor.entity';
import { VendorVoucher } from './VendorVoucher.entity';

@Entity()
export class VendorVoucherDenomination extends BaseDenomination {
    @OneToMany(() => VendorVoucher, (voucher) => voucher.denomination)
    vouchers: VendorVoucher[];

    @Column()
    vendorId: number;

    @ManyToOne(() => Vendor, (vendor) => vendor.vendorVoucherDenominations)
    @JoinColumn({ name: 'vendorId' })
    vendor: Vendor;
}
