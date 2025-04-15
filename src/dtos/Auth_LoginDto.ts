import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class Auth_LoginDto {
    @ApiProperty({ type: String, required: true, example: "hoangduy06104@gmail.com" })
    @IsString({ message: "Wallet address must be a string" })
    @IsNotEmpty({ message: "Wallet address is required" })
    readonly walletAddress: string;

    @ApiProperty({ type: String, required: true })
    @IsString({ message: "Password must be a string" })
    @IsNotEmpty({ message: "Password is required" })
    readonly password: string;
}