import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CustomLogger } from './modules/shared/custom.logger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({}));
  await app.listen(process.env.PORT ?? 3000);
  app.useLogger(app.get(CustomLogger));
}
bootstrap();
