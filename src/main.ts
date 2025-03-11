import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CustomLogger } from './modules/shared/custom.logger';
import { ValidationPipe } from '@nestjs/common';
import { JwtMiddleware } from './modules/middleware/jwt.middleware';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Api financial')
    .setDescription('The financial API')
    .setVersion('1.0')
    .addTag('financial')
    .addBearerAuth()
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  await app.listen(process.env.PORT ?? 3000);
  app.use(JwtMiddleware);
  app.useLogger(app.get(CustomLogger));
}
bootstrap();
