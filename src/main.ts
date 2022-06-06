import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { config as dotenvConfig } from 'dotenv';
import { AppModule } from './app.module';
import { Database, RadiusDatabase } from './utils/database';

dotenvConfig();

Database.getInstance();
RadiusDatabase.getInstance();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('AMNet API')
    .setDescription('AMNet API documentation')
    .setVersion('1.0')
    .addTag('access')
    .addTag('hardware')
    .addTag('settings')
    .addTag('user')
    .addTag('auth')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('doc', app, document);

  await app.listen(3333);
}
bootstrap();
