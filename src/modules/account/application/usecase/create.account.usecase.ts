import { Inject, Injectable } from '@nestjs/common';
import { CustomLogger } from 'src/modules/shared/custom.logger';
import { AccountRepositoryInterface } from '../../domain/repository/account.repository.interface';
import { Account } from '../../domain/entity/account.entity';
import { CreateAccountRequest } from './create.account.request';
import { Either, left, right } from 'src/modules/shared/either';
import { InvalidAccountDataError } from '../exceptions/InvalidAccountDataError';

@Injectable()
export class CreateAccountUsecase {
  constructor(
    @Inject('AccountRepositoryInterface')
    private readonly accountRepository: AccountRepositoryInterface,
    private readonly logger: CustomLogger,
  ) {}

  async handle(
    request: CreateAccountRequest,
  ): Promise<Either<Error | InvalidAccountDataError, Account>> {
    this.logger.log('Creating account usecase');
    this.logger.log(`Request received: ${JSON.stringify(request)}`);

    const account = Account.create(
      request.name,
      request.accountNumber,
      request.accountBalance,
      request.accountType,
    );

    const allowedAccountType = account.accountTypeAllowed();
    if (!allowedAccountType) {
      this.logger.error('Account type not allowed');
      return left(new InvalidAccountDataError('Invalid account type'));
    }

    const accountBalancePositive = account.accountBalanceIsPositive();
    if (!accountBalancePositive) {
      this.logger.error('Account balance is negative');
      return left(new InvalidAccountDataError('Account balance negative'));
    }

    this.logger.log('Checking if account number already exists');
    const accountExists = await this.accountRepository.findByAccountNumber(
      account.accountNumber,
    );
    if (accountExists.value !== null) {
      this.logger.error('Account number already exists');
      return left(new InvalidAccountDataError('Account already exists'));
    }

    this.logger.log('Creating account');
    const accountCreated = await this.accountRepository.create(account);
    if (accountCreated.isLeft()) {
      this.logger.error(
        'Error when creating account',
        accountCreated.value.message,
      );
      return left(accountCreated.value);
    }

    return right(accountCreated.value);
  }
}
