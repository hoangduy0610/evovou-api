import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { envFiles } from './commons/Constant';
import typeorm from './commons/TypeORMConfig';
import { AuthModule } from './modules/AuthModule';
import { FileModule } from './modules/FileModule';
import { GameModule } from './modules/GameModule';
import { UserModule } from './modules/UserModule';
import { VendorModule } from './modules/VendorModule';
import { VendorUserModule } from './modules/VendorUserModule';
import { VendorVoucherDenominationModule } from './modules/VendorVoucherDenominationModule';
import { VendorVoucherModule } from './modules/VendorVoucherModule';
import { VoucherDenominationModule } from './modules/VoucherDenominationModule';
import { VoucherModule } from './modules/VoucherModule';
import { ForumModule } from './modules/ForumModule';
import { VNPayModule } from './modules/VNPayModule';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: envFiles,
      isGlobal: true,
      load: [typeorm],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => (configService.get('typeorm'))
    }),
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
      },
    }),
    FileModule,
    AuthModule,
    UserModule,
    GameModule,
    VoucherModule,
    VendorModule,
    VendorUserModule,
    VendorVoucherDenominationModule,
    VendorVoucherModule,
    VoucherDenominationModule,
    ForumModule,
    VNPayModule,
  ]
})
export class AppModule { }