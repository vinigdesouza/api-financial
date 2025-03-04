import { Module } from '@nestjs/common';
import { AccountController } from './infrastructure/controller/account.controller';
import { CustomLogger } from 'src/modules/shared/custom.logger';
import { AccountRepository } from './infrastructure/dataprovider/account.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import AccountModel from './infrastructure/models/account.model';

@Module({
  imports: [TypeOrmModule.forFeature([AccountModel])],
  controllers: [AccountController],
  providers: [
    CustomLogger,
    AccountRepository,
    {
      provide: 'AccountRepositoryInterface',
      useClass: AccountRepository,
    },
  ],
  exports: ['AccountRepositoryInterface'],
})
export class AccountModule {}
