import { VendorVoucherDenomination_CreateDto, VendorVoucherDenomination_UpdateDto } from '@/dtos/VendorVoucherDenomination_Dtos';
import { EnumRoles } from '@/enums/EnumRoles';
import { AllowVendor } from '@/guards/AllowVendorDecorator';
import { Role } from '@/guards/RoleDecorator';
import { RoleGuard } from '@/guards/RoleGuard';
import { VendorVoucherDenominationService } from '@/services/VendorVoucherDenominationService';
import { Body, Controller, Delete, Get, Headers, HttpStatus, Param, Post, Put, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('vendor-voucher-denomination')
@Controller('vendor-voucher-denomination')
@UseGuards(AuthGuard('jwt'), RoleGuard)
@ApiBearerAuth()
export class VendorVoucherDenominationController {
    constructor(private readonly vendorVoucherDenominationService: VendorVoucherDenominationService) { }

    @Get('/list')
    @AllowVendor(true)
    @Role([EnumRoles.ROLE_ADMIN])
    async findAll(@Req() req, @Res() res, @Headers('vendor-id') vendorId: number) {
        return res.status(HttpStatus.OK).json(await this.vendorVoucherDenominationService.findAll(vendorId));
    }

    @Post('/')
    @AllowVendor(true)
    @Role([EnumRoles.ROLE_ADMIN])
    async create(@Req() req, @Res() res, @Headers('vendor-id') vendorId: number, @Body() dto: VendorVoucherDenomination_CreateDto) {
        return res.status(HttpStatus.OK).json(await this.vendorVoucherDenominationService.create(vendorId, dto));
    }

    @Get('/:id')
    @AllowVendor(true)
    @Role([EnumRoles.ROLE_ADMIN])
    async findById(@Req() req, @Res() res, @Headers('vendor-id') vendorId: number, @Param('id') id: number) {
        return res.status(HttpStatus.OK).json(await this.vendorVoucherDenominationService.findOne(vendorId, id));
    }

    @Put('/:id')
    @AllowVendor(true)
    @Role([EnumRoles.ROLE_ADMIN])
    async update(@Req() req, @Res() res, @Headers('vendor-id') vendorId: number, @Param('id') id: number, @Body() dto: VendorVoucherDenomination_UpdateDto) {
        return res.status(HttpStatus.OK).json(await this.vendorVoucherDenominationService.update(vendorId, id, dto));
    }

    @Delete('/:id')
    @AllowVendor(true)
    @Role([EnumRoles.ROLE_ADMIN])
    async delete(@Req() req, @Res() res, @Headers('vendor-id') vendorId: number, @Param('id') id: number) {
        return res.status(HttpStatus.OK).json(await this.vendorVoucherDenominationService.delete(vendorId, id));
    }
}