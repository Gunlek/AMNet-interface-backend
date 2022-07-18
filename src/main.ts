import { NestFactory, Reflector } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { RolesGuard } from './auth/roles.guard';
import * as express from 'express';
import * as favicon from 'serve-favicon';
import { join } from 'path';
import { AppService } from './app.service';
import { config as dotenvConfig } from 'dotenv';

dotenvConfig();
AppService.getInstance()

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  
  app.useGlobalGuards(new RolesGuard(new Reflector()));
  app.use('/proof', express.static(join(__dirname, '../src/access/proof')));
  app.use(express.static(join(__dirname, '../public')));
  app.use(favicon(join(__dirname, '../public/favicon.ico')));

  const config = new DocumentBuilder()
    .setTitle('AMNet API')
    .setDescription('AMNet API documentation')
    .setVersion('1.0')
    .addTag('access')
    .addTag('hardware')
    .addTag('settings')
    .addTag('user')
    .addTag('auth')
    .addTag('mail')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('doc', app, document);

  await app.listen(3333);
}
bootstrap();
