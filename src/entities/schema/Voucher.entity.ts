
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseVoucher } from '../base';
import { User } from './User.entity';
import { VoucherDenomination } from './VoucherDenomination.entity';
import { ForumPost } from './Forum.entity';

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

    @OneToMany(() => ForumPost, (forumPost) => forumPost.voucher, { nullable: true })
    forumPosts: ForumPost[];
}
