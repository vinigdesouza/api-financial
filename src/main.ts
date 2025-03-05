import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CustomLogger } from './modules/shared/custom.logger';
import { ValidationPipe } from '@nestjs/common';
import { JwtMiddleware } from './modules/middleware/jwt.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
  app.use(JwtMiddleware);
  app.useLogger(app.get(CustomLogger));
}
bootstrap();
