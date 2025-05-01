import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class Auth_LoginDto {
    @ApiProperty({ type: String, required: true, example: "hoangduy06104@gmail.com" })
    @IsString({ message: "Email must be a string" })
    @IsNotEmpty({ message: "Email is required" })
    readonly email: string;

    @ApiProperty({ type: String, required: true })
    @IsString({ message: "Password must be a string" })
    @IsNotEmpty({ message: "Password is required" })
    readonly password: string;

    @ApiPropertyOptional({ type: Number, required: false })
    @IsNumber({}, { message: "VendorId must be a number" })
    @IsOptional()
    readonly vendorId?: number;
}