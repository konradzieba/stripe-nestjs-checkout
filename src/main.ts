import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // raw body only for Stripe webhooks to avoid global overhead
  app.use('/stripe/webhook', express.raw({ type: '*/*' }));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Stripe Nest Example')
    .setDescription('The Stripe NestJS API description')
    .setVersion('1.0')
    .addTag('stripe')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  await app.listen(2345);
}
bootstrap();
