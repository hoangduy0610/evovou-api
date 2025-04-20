import { ApiProperty } from "@nestjs/swagger";
import { Auth_LoginDto } from "./Auth_LoginDto";
import { IsNotEmpty, IsString } from "class-validator";

export class Auth_RegiserDto extends Auth_LoginDto {
    @ApiProperty({ type: String, required: true })
    @IsString({ message: "Name must be a string" })
    @IsNotEmpty()
    readonly name: string;

    @ApiProperty({ type: String, required: true })
    @IsString({ message: "Wallet address must be a string" })
    @IsNotEmpty()
    readonly walletAddress: string;
}