import { VendorUser_CreateDto, VendorUser_UpdateDto } from '@/dtos/VendorUser_Dtos';
import { EnumRoles } from '@/enums/EnumRoles';
import { AllowVendor } from '@/guards/AllowVendorDecorator';
import { Role } from '@/guards/RoleDecorator';
import { RoleGuard } from '@/guards/RoleGuard';
import { VendorUserService } from '@/services/VendorUserService';
import { Body, Controller, Delete, Get, Headers, HttpStatus, Param, Post, Put, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('vendor-user')
@Controller('vendor-user')
@UseGuards(AuthGuard('jwt'), RoleGuard)
@ApiBearerAuth()
export class VendorUserController {
    constructor(private readonly vendorUserService: VendorUserService) { }

    @Get('/list')
    @AllowVendor(true)
    @Role([EnumRoles.ROLE_ADMIN])
    async findAll(@Req() req, @Res() res, @Headers('vendor-id') vendorId: number) {
        return res.status(HttpStatus.OK).json(await this.vendorUserService.findAll(vendorId));
    }

    @Post('/')
    @AllowVendor(true)
    @Role([EnumRoles.ROLE_ADMIN])
    async create(@Req() req, @Res() res, @Headers('vendor-id') vendorId: number, @Body() dto: VendorUser_CreateDto) {
        return res.status(HttpStatus.OK).json(await this.vendorUserService.create(vendorId, dto));
    }

    @Get('/:id')
    @AllowVendor(true)
    @Role([EnumRoles.ROLE_ADMIN])
    async findById(@Req() req, @Res() res, @Headers('vendor-id') vendorId: number, @Param('id') id: number) {
        return res.status(HttpStatus.OK).json(await this.vendorUserService.findOne(vendorId, id));
    }

    @Put('/:id')
    @AllowVendor(true)
    @Role([EnumRoles.ROLE_ADMIN])
    async update(@Req() req, @Res() res, @Headers('vendor-id') vendorId: number, @Param('id') id: number, @Body() dto: VendorUser_UpdateDto) {
        return res.status(HttpStatus.OK).json(await this.vendorUserService.update(vendorId, id, dto));
    }

    @Delete('/:id')
    @AllowVendor(true)
    @Role([EnumRoles.ROLE_ADMIN])
    async delete(@Req() req, @Res() res, @Headers('vendor-id') vendorId: number, @Param('id') id: number) {
        return res.status(HttpStatus.OK).json(await this.vendorUserService.delete(vendorId, id));
    }
}