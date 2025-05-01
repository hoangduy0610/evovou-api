import { ApiProperty, OmitType } from "@nestjs/swagger";
import { IsNumber, IsString } from "class-validator";

export class VoucherDenomination_CreateDto {
    @ApiProperty({ type: Number, required: true, example: 1000 })
    @IsNumber({}, { message: "Value must be a number" })
    readonly value: number;

    @ApiProperty({ type: String, required: true, example: "100.000 VND" })
    @IsString({ message: "Name must be a string" })
    readonly name: string;
}

export class VoucherDenomination_UpdateDto extends OmitType(VoucherDenomination_CreateDto, [] as const) {
}