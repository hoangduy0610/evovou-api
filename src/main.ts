import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as basicAuth from 'express-basic-auth';
import { Logger, ValidationPipe } from '@nestjs/common';
import { envFiles } from './commons/Constant';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import * as express from 'express';
import { json, urlencoded } from 'express';

require('dotenv').config(envFiles);

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['warn', 'error', 'debug', 'log', 'verbose'],
  });

  const uploadDir = join(process.cwd(), 'uploads');
  if (!existsSync(uploadDir)) {
    mkdirSync(uploadDir);
  }
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ limit: '50mb', extended: true }));
  app.use('/uploads', express.static(join(process.cwd(), 'uploads')));

  app.use('/swagger-ui.html', basicAuth({
    challenge: true,
    users: { admin: 'admin' },
  }));
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
  }));
  app.enableCors({});

  const options = new DocumentBuilder()
    .setTitle('EvoVou API')
    .setVersion('1.0')
    .addBearerAuth();

  if (process.env.MODE === 'production') {
    options.addServer("https://");
  } else if (process.env.MODE === 'test') {
    options.addServer("/");
  }

  const document = SwaggerModule.createDocument(app, options.build());
  SwaggerModule.setup('/swagger-ui.html', app, document);
  await app.listen(process.env.PORT || 80);

  Logger.log(`Server is running on ${await app.getUrl()}`, 'Bootstrap');
}

bootstrap();