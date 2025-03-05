import { Module } from '@nestjs/common';
import { CustomLogger } from 'src/modules/shared/custom.logger';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionController } from './infrastructure/controller/transaction.controller';
import { TransactionRepository } from './infrastructure/dataprovider/transaction.repository';
import TransactionModel from './infrastructure/models/transaction.model';
import { CreateTransactionUsecase } from './application/usecase/create.transaction.usecase';
import { AccountRepository } from '../account/infrastructure/dataprovider/account.repository';
import { AccountModule } from '../account/account.module';
import AccountModel from '../account/infrastructure/models/account.model';
import { TransactionListener } from './application/events/transaction.listener';
import { CqrsModule, EventBus } from '@nestjs/cqrs';

@Module({
  imports: [
    AccountModule,
    TypeOrmModule.forFeature([TransactionModel, AccountModel]),
    CqrsModule,
  ],
  controllers: [TransactionController],
  providers: [
    CustomLogger,
    CreateTransactionUsecase,
    TransactionRepository,
    TransactionListener,
    EventBus,
    {
      provide: 'TransactionRepositoryInterface',
      useClass: TransactionRepository,
    },
    {
      provide: 'AccountRepositoryInterface',
      useClass: AccountRepository,
    },
  ],
  exports: ['TransactionRepositoryInterface', CreateTransactionUsecase],
})
export class TransactionModule {}
