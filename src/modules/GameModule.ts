import { User } from '@/entities';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameController } from 'src/controllers/GameController';
import { GameService } from '../services/GameService';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            User,
        ])
    ],
    controllers: [GameController],
    providers: [
        GameService,
    ],
})
export class GameModule { }