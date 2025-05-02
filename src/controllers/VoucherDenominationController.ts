import { VoucherDenomination_CreateDto, VoucherDenomination_UpdateDto } from '@/dtos/VoucherDenomination_Dtos';
import { EnumRoles } from '@/enums/EnumRoles';
import { AllowVendor } from '@/guards/AllowVendorDecorator';
import { Role } from '@/guards/RoleDecorator';
import { RoleGuard } from '@/guards/RoleGuard';
import { VoucherDenominationService } from '@/services/VoucherDenominationService';
import { Body, Controller, Delete, Get, Headers, HttpStatus, Param, Post, Put, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('voucher-denomination')
@Controller('voucher-denomination')
@UseGuards(AuthGuard('jwt'), RoleGuard)
@ApiBearerAuth()
export class VoucherDenominationController {
    constructor(private readonly voucherDenominationService: VoucherDenominationService) { }

    @Get('/list')
    @AllowVendor(false)
    @Role([EnumRoles.ROLE_ADMIN])
    async findAll(@Req() req, @Res() res) {
        return res.status(HttpStatus.OK).json(await this.voucherDenominationService.findAll());
    }

    @Post('/')
    @AllowVendor(false)
    @Role([EnumRoles.ROLE_ADMIN])
    async create(@Req() req, @Res() res, @Body() dto: VoucherDenomination_CreateDto) {
        return res.status(HttpStatus.OK).json(await this.voucherDenominationService.create(dto));
    }

    @Get('/:id')
    @AllowVendor(false)
    @Role([EnumRoles.ROLE_ADMIN])
    async findById(@Req() req, @Res() res, @Param('id') id: number) {
        return res.status(HttpStatus.OK).json(await this.voucherDenominationService.findOne(id));
    }

    @Put('/:id')
    @AllowVendor(false)
    @Role([EnumRoles.ROLE_ADMIN])
    async update(@Req() req, @Res() res, @Param('id') id: number, @Body() dto: VoucherDenomination_UpdateDto) {
        return res.status(HttpStatus.OK).json(await this.voucherDenominationService.update(id, dto));
    }

    @Delete('/:id')
    @AllowVendor(false)
    @Role([EnumRoles.ROLE_ADMIN])
    async delete(@Req() req, @Res() res, @Param('id') id: number) {
        return res.status(HttpStatus.OK).json(await this.voucherDenominationService.delete(id));
    }
}