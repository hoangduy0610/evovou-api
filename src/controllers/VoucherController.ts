import { VoucherService } from '@/services/VoucherService';
import { Controller, Get, HttpStatus, Req, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('voucher')
@Controller('voucher')
export class VoucherController {
    constructor(private readonly voucherService: VoucherService) { }

    @Get('/token-uri/:amount')
    async getTokenUriJSON(@Req() req, @Res() res) {
        return res.status(HttpStatus.OK).json(await this.voucherService.getTokenUriJSON(req.params.amount));
    }
}