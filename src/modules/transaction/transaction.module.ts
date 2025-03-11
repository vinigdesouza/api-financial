import { Module } from '@nestjs/common';
import { CustomLogger } from '../shared/custom.logger';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionController } from './infrastructure/controller/transaction.controller';
import { TransactionRepository } from './infrastructure/dataprovider/transaction.repository';
import TransactionModel from './infrastructure/models/transaction.model';
import { CreateTransactionUsecase } from './application/usecase/create.transaction.usecase';
import { AccountRepository } from '../account/infrastructure/dataprovider/account.repository';
import { AccountModule } from '../account/account.module';
import AccountModel from '../account/infrastructure/models/account.model';
import { TransactionListener } from './application/events/transaction.listener';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { HttpModule } from '@nestjs/axios';
import { CurrencyGateway } from './infrastructure/gateway/currency.gateway';
import { CurrencyConversionService } from './domain/services/currency.conversion.service';
import { BullModule } from '@nestjs/bullmq';
import { TransactionService } from './domain/services/transaction.service';
import { TransactionProcessor } from './application/scheduled/transaction.processor';
import { TransactionScheduler } from './application/scheduled/transaction.scheduler';
import { TransactionQueue } from './application/scheduled/transaction.queue';
import ScheduledTransactionModel from './infrastructure/models/scheduledTransaction.model';
import { NotificationGateway } from '../shared/gateway/notification.gateway';

@Module({
  imports: [
    AccountModule,
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    TypeOrmModule.forFeature([
      TransactionModel,
      AccountModel,
      ScheduledTransactionModel,
    ]),
    EventEmitterModule.forRoot(),
    BullModule.registerQueue({ name: 'transactionQueue' }),
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: Number(process.env.REDIS_PORT) || 6379,
      },
    }),
  ],
  controllers: [TransactionController],
  providers: [
    CurrencyConversionService,
    CustomLogger,
    CreateTransactionUsecase,
    TransactionRepository,
    {
      provide: 'TransactionRepositoryInterface',
      useClass: TransactionRepository,
    },
    {
      provide: 'AccountRepositoryInterface',
      useClass: AccountRepository,
    },
    {
      provide: 'CurrencyGatewayInterface',
      useClass: CurrencyGateway,
    },
    TransactionListener,
    TransactionService,
    TransactionProcessor,
    TransactionScheduler,
    TransactionQueue,
    NotificationGateway,
  ],
  exports: [
    'TransactionRepositoryInterface',
    CreateTransactionUsecase,
    TransactionService,
    TransactionScheduler,
    NotificationGateway,
  ],
})
export class TransactionModule {}
