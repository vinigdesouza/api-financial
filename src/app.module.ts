import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { CustomLogger } from './modules/shared/custom.logger';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountController } from './modules/account/infrastructure/controller/account.controller';
import { AccountModule } from './modules/account/account.module';
import AccountModel from './modules/account/infrastructure/models/account.model';
import { CreateAccountTable1741108788820 } from './migration/1741128600352-CreateAccountTable';
import { JwtMiddleware } from './modules/middleware/jwt.middleware';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { TransactionController } from './modules/transaction/infrastructure/controller/transaction.controller';
import { CreateTransactionTable1741200787558 } from './migration/1741200787558-CreateTransactionTable';
import TransactionModel from './modules/transaction/infrastructure/models/transaction.model';
import { TransactionModule } from './modules/transaction/transaction.module';
import { CreateScheduledTransactionTable1741549013470 } from './migration/1741549013470-CreateScheduledTransactionTable';
import ScheduledTransactionModel from './modules/transaction/infrastructure/models/scheduledTransaction.model';
import { AuthRateLimiterService } from './modules/middleware/auth/auth-rate-limiter.service';

@Module({
  imports: [
    AccountModule,
    TransactionModule,
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,
          limit: 10,
        },
      ],
    }),
    ConfigModule.forRoot({ isGlobal: true }),
    LoggerModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: 5432,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [AccountModel, TransactionModel, ScheduledTransactionModel],
      migrations: [
        CreateAccountTable1741108788820,
        CreateTransactionTable1741200787558,
        CreateScheduledTransactionTable1741549013470,
      ],
      migrationsRun: true,
      synchronize: true,
      logging: true,
    }),
  ],
  controllers: [AccountController, TransactionController],
  providers: [
    CustomLogger,
    JwtMiddleware,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    AuthRateLimiterService,
  ],
  exports: [CustomLogger],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(JwtMiddleware)
      .forRoutes(AccountController, TransactionController);
  }
}
