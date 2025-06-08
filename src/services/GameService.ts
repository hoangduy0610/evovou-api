import { User } from '@/entities';
import { EnumGamePrizes } from '@/enums/EnumGamePrizes';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as moment from 'moment';
import { Repository } from 'typeorm';

@Injectable()
export class GameService {
    constructor(
        @InjectRepository(User) private readonly userRepository: Repository<User>
    ) { }

    async getGameChances(userId: number): Promise<{ wheelOfFortune: number; blindBox: number }> {
        const user = await this.findUserOrFail(userId);

        return {
            wheelOfFortune: this.daysSince(user.lastUsedWheelOfFortune),
            blindBox: this.daysSince(user.lastUsedBlindBox)
        };
    }

    async wheelOfFortune(userId: number): Promise<{ prizeIndex: number }> {
        const user = await this.findUserOrFail(userId);

        if (!this.canPlay(user.lastUsedWheelOfFortune)) {
            throw new BadRequestException('You can use Wheel of Fortune once a day');
        }

        const prizeIndex = this.getRandomPrizeIndex();
        user.balance += EnumGamePrizes[prizeIndex];
        user.lastUsedWheelOfFortune = this.nextAvailableDate(user.lastUsedWheelOfFortune);

        await this.userRepository.save(user);
        return { prizeIndex };
    }

    async blindBox(userId: number): Promise<{ prizeIndex: number }> {
        const user = await this.findUserOrFail(userId);

        if (!this.canPlay(user.lastUsedBlindBox)) {
            throw new BadRequestException('You can use Blind Box once a day');
        }

        const prizeIndex = this.getRandomPrizeIndex();
        user.balance += EnumGamePrizes[prizeIndex];
        user.lastUsedBlindBox = this.nextAvailableDate(user.lastUsedBlindBox);

        await this.userRepository.save(user);
        return { prizeIndex };
    }

    private async findUserOrFail(userId: number): Promise<User> {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            withDeleted: false
        });
        if (!user) throw new NotFoundException('User not found');
        return user;
    }

    private daysSince(date: Date): number {
        return moment().diff(moment(date), 'days');
    }

    private canPlay(lastUsed: Date): boolean {
        return this.daysSince(lastUsed) >= 1;
    }

    private getRandomPrizeIndex(): number {
        return Math.floor(Math.random() * EnumGamePrizes.length);
    }

    private nextAvailableDate(lastUsed: Date): Date {
        return moment(lastUsed).add(1, 'days').toDate();
    }
}
