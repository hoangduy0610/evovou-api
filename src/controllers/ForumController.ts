import { ForumComment_CreateDto } from '@/dtos/ForumComment_Dtos';
import { ForumPost_CreateDto, ForumPost_UpdateDto } from '@/dtos/ForumPost_Dtos';
import { RoleGuard } from '@/guards/RoleGuard';
import { ForumService } from '@/services/ForumService';
import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('forum')
@Controller('forum')
@UseGuards(AuthGuard('jwt'), RoleGuard)
@ApiBearerAuth()
export class ForumController {
    constructor(private readonly forumService: ForumService) { }

    @Get('posts')
    async listForumPosts(@Res() res) {
        const posts = await this.forumService.listForumPosts();
        return res.status(HttpStatus.OK).json(posts);
    }

    @Post('posts')
    async createForumPost(@Req() req, @Body() dto: ForumPost_CreateDto, @Res() res) {
        const post = await this.forumService.createForumPost(req.user.id, dto);
        return res.status(HttpStatus.CREATED).json(post);
    }

    @Get('posts/:id')
    async getForumPostById(@Param('id') id: number, @Res() res) {
        const post = await this.forumService.getForumPostById(Number(id));
        return res.status(HttpStatus.OK).json(post);
    }

    @Put('posts/:id')
    async updateForumPost(
        @Param('id') id: number,
        @Req() req,
        @Body() dto: ForumPost_UpdateDto,
        @Res() res
    ) {
        const post = await this.forumService.updateForumPost(Number(id), req.user.id, dto);
        return res.status(HttpStatus.OK).json(post);
    }

    @Delete('posts/:id')
    async deleteForumPost(@Param('id') id: number, @Req() req, @Res() res) {
        await this.forumService.deleteForumPost(Number(id), req.user.id);
        return res.status(HttpStatus.NO_CONTENT).send();
    }

    @Post('posts/:id/interaction')
    async toggleForumInteraction(@Param('id') id: number, @Req() req, @Res() res) {
        const interaction = await this.forumService.toggleForumInteraction(Number(id), req.user.id);
        return res.status(HttpStatus.OK).json(interaction);
    }

    @Post('comments')
    async addForumComment(
        @Req() req,
        @Body() dto: ForumComment_CreateDto,
        @Res() res
    ) {
        const comment = await this.forumService.addForumComment(req.user.id, dto);
        return res.status(HttpStatus.CREATED).json(comment);
    }

    @Delete('comments/:id')
    async deleteForumComment(@Param('id') id: number, @Req() req, @Res() res) {
        await this.forumService.deleteForumComment(Number(id), req.user.id);
        return res.status(HttpStatus.NO_CONTENT).send();
    }
}