import { BaseDenomination, User, Vendor } from "@/entities";
import { EnumVoucherStatus } from "@/enums/EnumVoucherStatus";
import { OmitType } from "@nestjs/swagger";


// NOT IMPLEMENTED YET
export class Voucher_CreateDto {
    // @ApiProperty({ type: Number, required: true, example: 1 })
    // @IsNumber({}, { message: "Denomination ID must be a number" })
    // readonly denominationId: number;

    // @ApiProperty({ type: String, required: true, example: "owner123" })
    // @IsString({ message: "Owner ID must be a string" })
    // readonly ownerId: string;

    // @ApiProperty({ type: Date, required: true, example: "2023-12-31T23:59:59.000Z" })
    // readonly expiredAt: Date;
}

export class Voucher_UpdateDto extends OmitType(Voucher_CreateDto, [] as const) {
}

export class Voucher_ResCommonVoucherDto {
    denominationId: number;
    ownerId: number;
    status: EnumVoucherStatus;
    expiredAt?: Date;
    redeemedAt?: Date;
    tokenId?: number;
    denomination: BaseDenomination;
    owner: User;
    vendor?: Vendor;
    code?: string;
}