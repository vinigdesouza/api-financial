import { Module } from '@nestjs/common';
import { AccountController } from './infrastructure/controller/account.controller';
import { CustomLogger } from 'src/modules/shared/custom.logger';
import { AccountRepository } from './infrastructure/dataprovider/account.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import AccountModel from './infrastructure/models/account.model';
import { CreateAccountUsecase } from './application/usecase/create.account.usecase';

@Module({
  imports: [TypeOrmModule.forFeature([AccountModel])],
  controllers: [AccountController],
  providers: [
    CustomLogger,
    CreateAccountUsecase,
    AccountRepository,
    {
      provide: 'AccountRepositoryInterface',
      useClass: AccountRepository,
    },
  ],
  exports: ['AccountRepositoryInterface', CreateAccountUsecase],
})
export class AccountModule {}
