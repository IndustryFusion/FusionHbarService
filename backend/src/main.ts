import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as dotenv from 'dotenv';
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Fusion HBAR Service API')
    .setDescription('Endpoints for IndustryFusion user/company, product objects to be published to Hedera Blockchain to prove authenticity and ownership of Digital Twins.')
    .setVersion('1.0')
    .addBearerAuth(
      {type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',},
      'access-token',)
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  const port = 4021;
  await app.listen(port);
}
bootstrap();