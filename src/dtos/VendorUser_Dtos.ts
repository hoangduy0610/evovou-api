import { EnumRoles } from "@/enums/EnumRoles";
import { ApiProperty, ApiPropertyOptional, OmitType } from "@nestjs/swagger";
import { IsEnum, IsNumber, IsOptional, IsString } from "class-validator";

export class VendorUser_CreateDto {
    @ApiProperty({
        description: "Vendor user name",
        example: "Vendor user Name",
    })
    @IsString()
    name: string;

    @ApiProperty({
        description: "User password",
        example: "password123",
    })
    @IsString()
    password: string;

    @ApiProperty({
        description: "User role",
        example: "ROLE_USER",
        enum: Object.values(EnumRoles),
    })
    @IsEnum(EnumRoles)
    role: EnumRoles;

    @ApiProperty({
        description: "User email",
        example: "user@example.com",
    })
    @IsString()
    email: string;

    @ApiProperty({
        description: "Vendor Id",
        example: 1,
    })
    @IsNumber()
    vendorId: number;
}

export class VendorUser_UpdateDto extends OmitType(VendorUser_CreateDto, ['password', 'vendorId'] as const) {
    @ApiPropertyOptional({
        description: "User avatar URL",
        example: "https://example.com/avatar.jpg",
        required: false,
    })
    @IsString()
    @IsOptional()
    avatar?: string;
}