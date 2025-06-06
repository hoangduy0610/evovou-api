import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class ForumPost_CreateDto {
    @ApiProperty({ required: true, type: String })
    @IsString()
    @IsNotEmpty()
    content: string;

    @ApiProperty({ required: false, type: [String] })
    @IsOptional()
    images?: string[];

    @ApiProperty({ required: false, type: Number })
    @IsOptional()
    voucherId?: number;
}

export class ForumPost_UpdateDto extends ForumPost_CreateDto {
}