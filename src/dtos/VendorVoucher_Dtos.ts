import { ApiProperty, OmitType } from "@nestjs/swagger";
import { IsNumber, IsString } from "class-validator";

export class VendorVoucher_CreateDto {
    @ApiProperty({ type: Number, required: true, example: 1 })
    @IsNumber({}, { message: "Denomination ID must be a number" })
    readonly denominationId: number;

    @ApiProperty({ type: Number, required: true, example: 1 })
    @IsString({ message: "Owner ID must be a number" })
    readonly ownerId: number;

    @ApiProperty({ type: Date, required: true, example: "2023-12-31T23:59:59.000Z" })
    readonly expiredAt: Date;
}

export class VendorVoucher_UpdateDto extends OmitType(VendorVoucher_CreateDto, [] as const) {
}

export class VendorVoucher_ExchangeDto {
    @ApiProperty({ type: Number, required: true, example: 1 })
    @IsNumber({}, { message: "Denomination ID must be a number" })
    readonly denominationId: number;

    @ApiProperty({ type: Number, required: true, example: 1 })
    @IsString({ message: "Vendor ID must be a number" })
    readonly vendorId: number;
}