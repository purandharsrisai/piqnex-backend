import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Every DTO in the app is validated with class-validator. whitelist strips
  // unknown properties instead of erroring, forbidNonWhitelisted rejects a
  // request that sent one - and transform lets @Type()/implicit conversion
  // (e.g. query string "2" -> number 2) work in controllers.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors();

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
