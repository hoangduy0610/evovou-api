import { Column, Entity } from "typeorm";
import { BaseSoftDelete } from "./base.entity";
import { EnumRoles } from "@/enums/EnumRoles";

@Entity({ name: "BaseUser" })
export class BaseUser extends BaseSoftDelete {
    @Column()
    password: string;

    @Column({ type: "enum", enum: Object.values(EnumRoles), default: EnumRoles.ROLE_USER })
    role: EnumRoles;

    @Column()
    name: string;

    @Column({ nullable: true })
    avatar: string;

    @Column({ unique: true })
    email: string;
}