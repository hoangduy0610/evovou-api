
import { EnumOrderStatus } from '@/enums/EnumOrderStatus';
import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseSoftDelete } from '../base';
import { User } from './User.entity';
import { VoucherDenomination } from './VoucherDenomination.entity';

@Entity()
export class Order extends BaseSoftDelete {
    @Column()
    txnRef: string;

    @Column()
    denominationId: number;

    @ManyToOne(() => VoucherDenomination, (denomination) => denomination.orders)
    denomination: VoucherDenomination;

    @Column()
    userId: number;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    user: User;

    @Column({ type: 'enum', enum: Object.values(EnumOrderStatus), default: EnumOrderStatus.PENDING })
    status: EnumOrderStatus;

    @Column({ nullable: true })
    expiresAt: Date;

    @Column({ nullable: true })
    paymentUrl: string;
}
