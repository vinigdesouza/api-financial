import { Module } from '@nestjs/common';
import { AccountController } from './infrastructure/controller/account.controller';
import { CustomLogger } from '../shared/custom.logger';
import { AccountRepository } from './infrastructure/dataprovider/account.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import AccountModel from './infrastructure/models/account.model';
import { CreateAccountUsecase } from './application/usecase/create.account.usecase';
import { UpdateAccountUsecase } from './application/usecase/update.account.usecase';

@Module({
  imports: [TypeOrmModule.forFeature([AccountModel])],
  controllers: [AccountController],
  providers: [
    CustomLogger,
    CreateAccountUsecase,
    UpdateAccountUsecase,
    AccountRepository,
    {
      provide: 'AccountRepositoryInterface',
      useClass: AccountRepository,
    },
  ],
  exports: [
    'AccountRepositoryInterface',
    CreateAccountUsecase,
    UpdateAccountUsecase,
  ],
})
export class AccountModule {}
