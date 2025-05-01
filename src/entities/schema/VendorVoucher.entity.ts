
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseVoucher } from '../base';
import { User } from './User.entity';
import { Vendor } from './Vendor.entity';
import { VendorVoucherDenomination } from './VendorVoucherDenomination.entity';

@Entity()
export class VendorVoucher extends BaseVoucher {
    @ManyToOne(() => VendorVoucherDenomination, (denomination) => denomination.vouchers)
    @JoinColumn({ name: 'denominationId' })
    denomination: VendorVoucherDenomination;

    @ManyToOne(() => User, (user) => user.vendorVouchers)
    @JoinColumn({ name: 'ownerId', referencedColumnName: 'id' })
    owner: User;

    @Column()
    vendorId: number;

    @ManyToOne(() => Vendor, (vendor) => vendor.vendorVouchers)
    @JoinColumn({ name: 'vendorId' })
    vendor: Vendor;

    @Column()
    code: string;
}
