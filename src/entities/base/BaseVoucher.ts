import { EnumVoucherStatus } from "@/enums/EnumVoucherStatus";
import { Column, Entity } from "typeorm";
import { BaseSoftDelete } from "./base.entity";

@Entity({ name: "BaseVoucher" })
export class BaseVoucher extends BaseSoftDelete {
    @Column()
    denominationId: number;

    @Column()
    ownerId: number;

    @Column({ type: 'enum', enum: Object.values(EnumVoucherStatus), default: EnumVoucherStatus.READY })
    status: EnumVoucherStatus;

    @Column({ type: 'timestamp', nullable: true })
    expiredAt: Date;

    @Column({ type: 'timestamp', nullable: true })
    redeemedAt: Date;
}