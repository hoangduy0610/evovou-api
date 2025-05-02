import { Vendor_CreateDto, Vendor_UpdateDto } from '@/dtos/Vendor_Dtos';
import { EnumRoles } from '@/enums/EnumRoles';
import { Role } from '@/guards/RoleDecorator';
import { RoleGuard } from '@/guards/RoleGuard';
import { VendorService } from '@/services/VendorService';
import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('vendor')
@Controller('vendor')
export class VendorController {
    constructor(private readonly vendorService: VendorService) { }

    @Get('/list')
    // @UseGuards(AuthGuard('jwt'), RoleGuard)
    // @ApiBearerAuth()
    // @Role([EnumRoles.ROLE_ADMIN])
    async findAll(@Req() req, @Res() res) {
        return res.status(HttpStatus.OK).json(await this.vendorService.findAll());
    }

    @Post('/')
    @UseGuards(AuthGuard('jwt'), RoleGuard)
    @ApiBearerAuth()
    @Role([EnumRoles.ROLE_ADMIN])
    async create(@Req() req, @Res() res, @Body() dto: Vendor_CreateDto) {
        return res.status(HttpStatus.OK).json(await this.vendorService.create(dto));
    }

    @Get('/:id')
    // @UseGuards(AuthGuard('jwt'), RoleGuard)
    // @ApiBearerAuth()
    // @Role([EnumRoles.ROLE_ADMIN])
    async findById(@Req() req, @Res() res, @Param('id') id: number) {
        return res.status(HttpStatus.OK).json(await this.vendorService.findOne(id));
    }

    @Put('/:id')
    @UseGuards(AuthGuard('jwt'), RoleGuard)
    @ApiBearerAuth()
    @Role([EnumRoles.ROLE_ADMIN])
    async update(@Req() req, @Res() res, @Param('id') id: number, @Body() dto: Vendor_UpdateDto) {
        return res.status(HttpStatus.OK).json(await this.vendorService.update(id, dto));
    }

    @Delete('/:id')
    @UseGuards(AuthGuard('jwt'), RoleGuard)
    @ApiBearerAuth()
    @Role([EnumRoles.ROLE_ADMIN])
    async delete(@Req() req, @Res() res, @Param('id') id: number) {
        return res.status(HttpStatus.OK).json(await this.vendorService.delete(id));
    }
}