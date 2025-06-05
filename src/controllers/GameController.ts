import { RoleGuard } from '@/guards/RoleGuard';
import { GameService } from '@/services/GameService';
import { Controller, Get, HttpStatus, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('game')
@Controller('game')
@UseGuards(AuthGuard('jwt'), RoleGuard)
@ApiBearerAuth()
export class GameController {
    constructor(private readonly gameService: GameService) { }

    @Get('/chances')
    async getChances(@Req() req, @Res() res) {
        return res.status(HttpStatus.OK).json(await this.gameService.getGameChances(req.user.id));
    }

    @Get('/wheel-of-fortune')
    async wheelOfFortune(@Req() req, @Res() res) {
        return res.status(HttpStatus.OK).json(await this.gameService.wheelOfFortune(req.user.id));
    }

    @Get('/blind-box')
    async blindBox(@Req() req, @Res() res) {
        return res.status(HttpStatus.OK).json(await this.gameService.blindBox(req.user.id));
    }
}