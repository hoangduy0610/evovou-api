import { ForumComment_CreateDto } from '@/dtos/ForumComment_Dtos';
import { ForumPost_CreateDto, ForumPost_UpdateDto } from '@/dtos/ForumPost_Dtos';
import { User } from '@/entities';
import { ForumComment, ForumInteraction, ForumPost } from '@/entities/schema/Forum.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ForumService {
    constructor(
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        @InjectRepository(ForumPost) private readonly forumPostRepository: Repository<ForumPost>,
        @InjectRepository(ForumInteraction) private readonly forumInteractionRepository: Repository<ForumInteraction>,
        @InjectRepository(ForumComment) private readonly forumCommentRepository: Repository<ForumComment>,
    ) { }

    async listForumPosts(): Promise<ForumPost[]> {
        return await this.forumPostRepository.find({
            relations: [
                'author',
                'voucher',
                'forumInteractions',
                'forumInteractions.user',
                'forumComments',
                'forumComments.user',
            ],
            withDeleted: false
        });
    }

    async createForumPost(userId: number, dto: ForumPost_CreateDto): Promise<ForumPost> {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            withDeleted: false
        });
        if (!user) throw new NotFoundException('User not found');

        const forumPost = this.forumPostRepository.create({
            content: dto.content,
            images: dto.images,
            voucherId: dto.voucherId,
            userId: user.id,
        });
        return await this.forumPostRepository.save(forumPost);
    }

    async getForumPostById(postId: number): Promise<ForumPost> {
        const post = await this.forumPostRepository.findOne({
            where: { id: postId },
            relations: [
                'author',
                'voucher',
                'forumInteractions',
                'forumInteractions.user',
                'forumComments',
                'forumComments.user',
            ],
            withDeleted: false
        });
        if (!post) throw new NotFoundException('Forum post not found');
        return post;
    }

    async updateForumPost(postId: number, userId: number, dto: ForumPost_UpdateDto): Promise<ForumPost> {
        const post = await this.forumPostRepository.findOne({
            where: { id: postId, userId: userId },
            withDeleted: false
        });
        if (!post) throw new NotFoundException('Forum post not found or does not belong to user');

        post.content = dto.content;
        post.images = dto.images;
        post.voucherId = dto.voucherId;

        return await this.forumPostRepository.save(post);
    }

    async deleteForumPost(postId: number, userId: number): Promise<void> {
        const post = await this.forumPostRepository.findOne({
            where: { id: postId, userId: userId },
            withDeleted: false
        });
        if (!post) throw new NotFoundException('Forum post not found or does not belong to user');

        await this.forumPostRepository.softDelete(post.id);
    }

    async toggleForumInteraction(postId: number, userId: number): Promise<ForumInteraction> {
        const post = await this.forumPostRepository.findOne({
            where: { id: postId },
            withDeleted: false
        });
        if (!post) throw new NotFoundException('Forum post not found');

        let interaction = await this.forumInteractionRepository.findOne({
            where: { postId: post.id, userId: userId },
            withDeleted: false
        });

        if (interaction) {
            // If interaction exists, delete it
            await this.forumInteractionRepository.delete(interaction.id);
            return interaction;
        } else {
            // If no interaction exists, create a new one
            interaction = this.forumInteractionRepository.create({ postId: post.id, userId: userId });
            return await this.forumInteractionRepository.save(interaction);
        }
    }

    async addForumComment(userId: number, dto: ForumComment_CreateDto): Promise<ForumComment> {
        const post = await this.forumPostRepository.findOne({
            where: { id: dto.postId },
            withDeleted: false
        });
        if (!post) throw new NotFoundException('Forum post not found');

        const user = await this.userRepository.findOne({
            where: { id: userId },
            withDeleted: false
        });
        if (!user) throw new NotFoundException('User not found');

        const comment = this.forumCommentRepository.create({
            content: dto.content,
            postId: post.id,
            userId: user.id,
        });
        return await this.forumCommentRepository.save(comment);
    }

    async deleteForumComment(commentId: number, userId: number): Promise<void> {
        const comment = await this.forumCommentRepository.findOne({
            where: { id: commentId, userId: userId },
            withDeleted: false
        });
        if (!comment) throw new NotFoundException('Forum comment not found or does not belong to user');

        await this.forumCommentRepository.softDelete(comment.id);
    }
}
