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

  // piqnex-frontend (Next.js) calls this API from the browser's perspective
  // via Server Components/Actions (not from client-side JS), but CORS still
  // applies to any same-origin dev tooling and future client-side calls -
  // lock it to the frontend's own origin rather than leaving it wide open.
  // FRONTEND_ORIGIN defaults to the frontend's default `next dev` port.
  app.enableCors({
    origin: process.env.FRONTEND_ORIGIN ?? 'http://localhost:3000',
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
