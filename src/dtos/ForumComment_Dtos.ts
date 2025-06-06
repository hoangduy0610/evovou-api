import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class ForumComment_CreateDto {
    @ApiProperty({ required: true, type: String })
    @IsString()
    @IsNotEmpty()
    content: string;

    @ApiProperty({ required: true, type: Number })
    @IsNotEmpty()
    postId: number;
}

export class ForumComment_UpdateDto extends ForumComment_CreateDto {
}