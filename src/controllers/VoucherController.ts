import { EnumRoles } from '@/enums/EnumRoles';
import { Role } from '@/guards/RoleDecorator';
import { RoleGuard } from '@/guards/RoleGuard';
import { VoucherService } from '@/services/VoucherService';
import { Body, Controller, Get, HttpStatus, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('voucher')
@Controller('voucher')
export class VoucherController {
    constructor(private readonly voucherService: VoucherService) { }

    @Get('/token-uri/:amount')
    async getTokenUriJSON(@Req() req, @Res() res) {
        return res.status(HttpStatus.OK).json(await this.voucherService.getTokenUriJSON(req.params.amount));
    }

    @Get('/list')
    @ApiBearerAuth()
    @UseGuards(AuthGuard('jwt'), RoleGuard)
    @Role([EnumRoles.ROLE_ADMIN])
    async getAll(@Req() req, @Res() res) {
        const vouchers = await this.voucherService.listAllVouchers();
        return res.status(HttpStatus.OK).json(vouchers);
    }

    @Get('/my-vouchers')
    @ApiBearerAuth()
    @UseGuards(AuthGuard('jwt'), RoleGuard)
    @Role([EnumRoles.ROLE_ADMIN, EnumRoles.ROLE_USER])
    @ApiQuery({ name: 'brandId', required: false, type: Number })
    async getMyVouchers(@Req() req, @Res() res, @Query('brandId') brandId?: number) {
        const vouchers = await this.voucherService.getMyVouchers(req.user.id, brandId);
        return res.status(HttpStatus.OK).json(vouchers);
    }

    @Post('/redeem/:voucherId')
    @ApiBearerAuth()
    @UseGuards(AuthGuard('jwt'), RoleGuard)
    @Role([EnumRoles.ROLE_ADMIN, EnumRoles.ROLE_USER])
    async redeemVoucher(@Req() req, @Res() res) {
        return res.status(HttpStatus.OK).json(await this.voucherService.redeemVoucher(req.params.voucherId, req.user.id));
    }

    @Post('/transfer')
    @ApiBearerAuth()
    @UseGuards(AuthGuard('jwt'), RoleGuard)
    @Role([EnumRoles.ROLE_ADMIN, EnumRoles.ROLE_USER])
    async transferVoucher(@Req() req, @Res() res, @Body() dto: { voucherId: number, recipientId: number }) {
        return res.status(HttpStatus.OK).json(await this.voucherService.transferVoucher(dto.voucherId, req.user.id, dto.recipientId));
    }
}