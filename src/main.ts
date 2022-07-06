import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as express from 'express';
import { join } from 'path';
import { AppService } from './app.service';


AppService.getInstance()

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  app.use(express.static(join(__dirname, '../src/access/proof')))
  
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
