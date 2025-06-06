import { User } from '@/entities';
import { ForumComment, ForumInteraction, ForumPost } from '@/entities/schema/Forum.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ForumController } from 'src/controllers/ForumController';
import { ForumService } from '../services/ForumService';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            User,
            ForumPost,
            ForumInteraction,
            ForumComment,
        ])
    ],
    controllers: [ForumController],
    providers: [
        ForumService,
    ],
})
export class ForumModule { }