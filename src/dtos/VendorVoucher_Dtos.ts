import { ApiProperty, OmitType } from "@nestjs/swagger";
import { IsNumber, IsString } from "class-validator";

export class VendorVoucher_CreateDto {
    @ApiProperty({ type: Number, required: true, example: 1 })
    @IsNumber({}, { message: "Denomination ID must be a number" })
    readonly denominationId: number;

    @ApiProperty({ type: String, required: true, example: "owner123" })
    @IsString({ message: "Owner ID must be a string" })
    readonly ownerId: string;

    @ApiProperty({ type: Date, required: true, example: "2023-12-31T23:59:59.000Z" })
    readonly expiredAt: Date;

    @ApiProperty({ type: Number, required: true, example: 1 })
    @IsNumber({}, { message: "Vendor ID must be a number" })
    readonly vendorId: number;
}

export class VendorVoucher_UpdateDto extends OmitType(VendorVoucher_CreateDto, ['vendorId'] as const) {
}