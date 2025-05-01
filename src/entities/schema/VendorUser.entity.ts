
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseUser } from '../base';
import { Vendor } from './Vendor.entity';

@Entity()
export class VendorUser extends BaseUser {
    @Column()
    vendorId: number;

    @ManyToOne(() => Vendor, (vendor) => vendor.vendorUsers)
    @JoinColumn({ name: 'vendorId' })
    vendor: Vendor;
}
