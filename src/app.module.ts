import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './modules/AuthModule';
import typeorm from './commons/TypeORMConfig';
import { TypeOrmModule } from '@nestjs/typeorm';
import { envFiles } from './commons/Constant';
import { FileModule } from './modules/FileModule';
import { UserModule } from './modules/UserModule';
import { VoucherModule } from './modules/VoucherModule';
import { VendorModule } from './modules/VendorModule';
import { VendorUserModule } from './modules/VendorUserModule';

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
    FileModule,
    AuthModule,
    UserModule,
    VoucherModule,
    VendorModule,
    VendorUserModule,
  ]
})
export class AppModule { }