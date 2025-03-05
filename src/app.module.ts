import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerModule } from 'nestjs-pino';
import { CustomLogger } from './modules/shared/custom.logger';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountController } from './modules/account/infrastructure/controller/account.controller';
import { AccountModule } from './modules/account/account.module';
import AccountModel from './modules/account/infrastructure/models/account.model';
import { CreateAccountTable1741108788820 } from './migration/1741128600352-CreateAccountTable';
import { JwtMiddleware } from './modules/middleware/jwt.middleware';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    AccountModule,
    ConfigModule.forRoot({ isGlobal: true }),
    LoggerModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'vinicius',
      password: 'vini@dev',
      database: 'financial_db',
      entities: [AccountModel],
      migrations: [CreateAccountTable1741108788820],
      // synchronize: true,
      logging: true,
    }),
  ],
  controllers: [AppController, AccountController],
  providers: [AppService, CustomLogger, JwtMiddleware],
  exports: [CustomLogger],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(JwtMiddleware).forRoutes(AccountController);
  }
}
