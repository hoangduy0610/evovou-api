import { VendorVoucher_CreateDto, VendorVoucher_ExchangeDto, VendorVoucher_UpdateDto } from '@/dtos/VendorVoucher_Dtos';
import { EnumRoles } from '@/enums/EnumRoles';
import { AllowVendor } from '@/guards/AllowVendorDecorator';
import { Role } from '@/guards/RoleDecorator';
import { RoleGuard } from '@/guards/RoleGuard';
import { VendorVoucherService } from '@/services/VendorVoucherService';
import { Body, Controller, Delete, Get, Headers, HttpStatus, Param, Post, Put, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('vendor-voucher')
@Controller('vendor-voucher')
@UseGuards(AuthGuard('jwt'), RoleGuard)
@ApiBearerAuth()
export class VendorVoucherController {
    constructor(private readonly vendorVoucherService: VendorVoucherService) { }

    @Get('/list')
    @AllowVendor(true)
    @Role([EnumRoles.ROLE_ADMIN])
    async findAll(@Req() req, @Res() res, @Headers('vendor-id') vendorId: number) {
        return res.status(HttpStatus.OK).json(await this.vendorVoucherService.findAll(vendorId));
    }

    @Post('/')
    @AllowVendor(true)
    @Role([EnumRoles.ROLE_ADMIN])
    async create(@Req() req, @Res() res, @Headers('vendor-id') vendorId: number, @Body() dto: VendorVoucher_CreateDto) {
        return res.status(HttpStatus.OK).json(await this.vendorVoucherService.create(vendorId, dto));
    }

    @Get('/:id')
    @AllowVendor(true)
    @Role([EnumRoles.ROLE_ADMIN])
    async findById(@Req() req, @Res() res, @Headers('vendor-id') vendorId: number, @Param('id') id: number) {
        return res.status(HttpStatus.OK).json(await this.vendorVoucherService.findOne(vendorId, id));
    }

    @Put('/:id')
    @AllowVendor(true)
    @Role([EnumRoles.ROLE_ADMIN])
    async update(@Req() req, @Res() res, @Headers('vendor-id') vendorId: number, @Param('id') id: number, @Body() dto: VendorVoucher_UpdateDto) {
        return res.status(HttpStatus.OK).json(await this.vendorVoucherService.update(vendorId, id, dto));
    }

    @Delete('/:id')
    @AllowVendor(true)
    @Role([EnumRoles.ROLE_ADMIN])
    async delete(@Req() req, @Res() res, @Headers('vendor-id') vendorId: number, @Param('id') id: number) {
        return res.status(HttpStatus.OK).json(await this.vendorVoucherService.delete(vendorId, id));
    }

    @Post('/exchange')
    @AllowVendor(false)
    @Role([EnumRoles.ROLE_ADMIN, EnumRoles.ROLE_USER])
    async exchange(@Req() req, @Res() res, @Body() dto: VendorVoucher_ExchangeDto) {
        return res.status(HttpStatus.OK).json(await this.vendorVoucherService.exchange(req.user, dto));
    }
}