import { ApiProperty, OmitType } from "@nestjs/swagger";
import { IsNumber, IsNotEmpty, IsString, IsEnum, IsOptional } from "class-validator";
import { Auth_RegiserDto } from "./Auth_RegisterDto";
import { EnumRoles } from "@/enums/EnumRoles";

export class User_CreateDto extends Auth_RegiserDto {
    @ApiProperty({ enum: EnumRoles })
    @IsEnum(EnumRoles)
    role: EnumRoles;
}

export class User_UpdateDto {
    @ApiProperty({ type: String, required: false, example: "hoangduy06104@gmail.com" })
    @IsString({ message: "Email must be a string" })
    @IsOptional()
    readonly email: string;

    @ApiProperty({ type: String, required: false })
    @IsString({ message: "Name must be a string" })
    @IsOptional()
    readonly name: string;

    @ApiProperty({ type: String, required: false })
    @IsString({ message: "Wallet address must be a string" })
    @IsOptional()
    readonly walletAddress: string;

    @ApiProperty({ enum: EnumRoles })
    @IsEnum(EnumRoles)
    @IsOptional()
    role: EnumRoles;

    @ApiProperty()
    @IsString()
    @IsOptional()
    avatar?: string;
}

export class User_UpdateMeDto extends OmitType(User_UpdateDto, ['role']) {
}
