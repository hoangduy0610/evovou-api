import { VendorController } from '@/controllers/VendorController';
import { Vendor } from '@/entities';
import { VendorService } from '@/services/VendorService';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Vendor,
        ])
    ],
    controllers: [VendorController],
    providers: [
        VendorService,
    ],
})
export class VendorModule { }