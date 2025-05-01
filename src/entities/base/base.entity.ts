import {
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";

@Entity({ name: "BaseEntity" })
export class BaseEntity {
    @PrimaryGeneratedColumn()
    public id: number;

    @CreateDateColumn({ default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @UpdateDateColumn({ default: () => 'CURRENT_TIMESTAMP' })
    updatedAt: Date;
}

@Entity({ name: "BaseSoftDelete" })
export class BaseSoftDelete extends BaseEntity {
    @DeleteDateColumn({ nullable: true })
    deletedAt: Date;
}