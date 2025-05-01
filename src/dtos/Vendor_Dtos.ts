import { ApiProperty, OmitType } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class Vendor_CreateDto {
    @ApiProperty({
        description: "Vendor name",
        example: "Vendor Name",
    })
    @IsString()
    name: string;

    @ApiProperty({
        description: "Vendor email",
        example: "vendor@gmail.com",
    })
    @IsString()
    email: string;

    @ApiProperty({
        description: "Vendor description",
        example: "This is a vendor description",
    })
    @IsString()
    description: string;

    @ApiProperty({
        description: "Vendor logo URL",
        example: "https://example.com/logo.png",
    })
    @IsString()
    logo: string;

    @ApiProperty({
        description: "Vendor website URL",
        example: "https://vendorwebsite.com",
    })
    @IsString()
    website: string;

    @ApiProperty({
        description: "Vendor phone number",
        example: "+1234567890",
    })
    @IsString()
    phone: string;

    @ApiProperty({
        description: "Vendor address",
        example: "123 Vendor Street, Vendor City",
    })
    @IsString()
    address: string;

    @ApiProperty({
        description: "Instructions on how to use the vendor's voucher",
        example: "Follow the steps on our website to get started.",
    })
    @IsString()
    howToUse: string;
}

export class Vendor_UpdateDto extends OmitType(Vendor_CreateDto, [] as const) {

}