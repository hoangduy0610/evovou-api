import { EnumPaymentMethod } from '@/enums/EnumPaymentMethod';
import { RoleGuard } from '@/guards/RoleGuard';
import { VNPayService } from '@/services/VNPayService';
import { Controller, Get, Param, Query, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('vnpay')
@Controller('vnpay')
export class VNPayController {
    constructor(
        private readonly vnpayService: VNPayService,
    ) { }

    // http://localhost:6565/vnpay/pay/10000
    @Get('pay/:id')
    @ApiBearerAuth()
    @UseGuards(AuthGuard('jwt'), RoleGuard)
    async createPaymentUrl(@Req() req, @Res() res, @Param('id') denominationId: number, @Query('method') method: EnumPaymentMethod) {
        const ipAddr =
            req.headers['x-forwarded-for'] ||
            req.connection.remoteAddress ||
            req.socket?.remoteAddress ||
            (req.connection as any).socket?.remoteAddress;
        return res.status(200).json(
            await this.vnpayService.createPaymentUrl(req.user.id, ipAddr as string, denominationId, method)
        );
    }

    @Get('ipn')
    async handleIPN(@Req() req, @Res() res) {
        return await this.vnpayService.handleIPN(req, res);
    }

    @Get('return')
    async verifyReturnUrl(@Req() req, @Res() res) {
        return await this.vnpayService.verifyReturnUrl(req, res);
    }
}