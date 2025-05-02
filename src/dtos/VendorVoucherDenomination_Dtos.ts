import { ApiProperty, OmitType } from "@nestjs/swagger";
import { IsNumber, IsString } from "class-validator";

export class VendorVoucherDenomination_CreateDto {
    @ApiProperty({ type: Number, required: true, example: 1000 })
    @IsNumber({}, { message: "Value must be a number" })
    readonly value: number;

    @ApiProperty({ type: String, required: true, example: "100.000 VND" })
    @IsString({ message: "Name must be a string" })
    readonly name: string;
}

export class VendorVoucherDenomination_UpdateDto extends OmitType(VendorVoucherDenomination_CreateDto, [] as const) {
}