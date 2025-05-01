import { ApiProperty, OmitType } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";
import { Auth_LoginDto } from "./Auth_LoginDto";

export class Auth_RegiserDto extends OmitType(Auth_LoginDto, ['vendorId'] as const) {
    @ApiProperty({ type: String, required: true })
    @IsString({ message: "Name must be a string" })
    @IsNotEmpty()
    readonly name: string;

    @ApiProperty({ type: String, required: true })
    @IsString({ message: "Wallet address must be a string" })
    @IsNotEmpty()
    readonly walletAddress: string;
}