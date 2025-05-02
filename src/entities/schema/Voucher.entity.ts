
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseVoucher } from '../base';
import { User } from './User.entity';
import { VoucherDenomination } from './VoucherDenomination.entity';

@Entity()
export class Voucher extends BaseVoucher {
    @ManyToOne(() => VoucherDenomination, (denomination) => denomination.vouchers)
    @JoinColumn({ name: 'denominationId' })
    denomination: VoucherDenomination;

    @ManyToOne(() => User, (user) => user.vouchers)
    @JoinColumn({ name: 'ownerId', referencedColumnName: 'id' })
    owner: User;

    @Column()
    tokenId: number;
}
