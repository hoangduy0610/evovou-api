import { EnumRoles } from '@/enums/EnumRoles';
import { Role } from '@/guards/RoleDecorator';
import { RoleGuard } from '@/guards/RoleGuard';
import { VoucherService } from '@/services/VoucherService';
import { Controller, Get, HttpStatus, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

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
}