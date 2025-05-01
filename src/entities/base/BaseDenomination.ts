import { Column, Entity } from "typeorm";
import { BaseSoftDelete } from "./base.entity";

@Entity({ name: "BaseDenomination" })
export class BaseDenomination extends BaseSoftDelete {
    @Column({ type: 'integer', nullable: false })
    value: number;

    @Column()
    name: string;
}