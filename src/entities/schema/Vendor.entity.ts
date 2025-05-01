
import { Column, Entity, OneToMany } from 'typeorm';
import { BaseSoftDelete } from '../base';
import { VendorUser } from './VendorUser.entity';
import { VendorVoucher } from './VendorVoucher.entity';
import { VendorVoucherDenomination } from './VendorVoucherDenomination.entity';

@Entity()
export class Vendor extends BaseSoftDelete {
    @Column()
    name: string;

    @Column()
    description: string;

    @Column()
    logo: string;

    @Column()
    website: string;

    @Column()
    email: string;

    @Column()
    phone: string;

    @Column()
    address: string;

    @Column()
    howToUse: string;

    @OneToMany(() => VendorVoucher, (vendorVoucher) => vendorVoucher.vendor)
    vendorVouchers: VendorVoucher[];

    @OneToMany(() => VendorVoucherDenomination, (vendorVoucherDenomination) => vendorVoucherDenomination.vendor)
    vendorVoucherDenominations: VendorVoucherDenomination[];

    @OneToMany(() => VendorUser, (vendorUser) => vendorUser.vendor)
    vendorUsers: VendorUser[];
}
