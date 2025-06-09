import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseSoftDelete } from '../base';
import { User } from './User.entity';
import { Voucher } from './Voucher.entity';

@Entity()
export class ForumPost extends BaseSoftDelete {
    @Column()
    content: string;

    @Column('text', { array: true, nullable: true })
    images: string[];

    @Column({ nullable: true })
    voucherId?: number;

    @ManyToOne(() => Voucher, (voucher) => voucher.forumPosts, { nullable: true })
    voucher?: Voucher;

    @Column()
    userId: number;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    author: User;

    @OneToMany(() => ForumInteraction, (interaction) => interaction.post, { cascade: true })
    forumInteractions: ForumInteraction[];

    @OneToMany(() => ForumComment, (comment) => comment.post, { cascade: true })
    forumComments: ForumComment[];
}

@Entity()
export class ForumInteraction extends BaseSoftDelete {
    @Column()
    postId: number;

    @ManyToOne(() => ForumPost, (post) => post.forumInteractions, { onDelete: 'CASCADE' })
    post: ForumPost;

    @Column()
    userId: number;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    user: User;
}

@Entity()
export class ForumComment extends ForumInteraction {
    @Column()
    content: string;
}