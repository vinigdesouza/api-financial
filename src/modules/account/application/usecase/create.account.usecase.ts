import { Inject, Injectable } from '@nestjs/common';
import { CustomLogger } from 'src/modules/shared/custom.logger';
import { AccountRepositoryInterface } from '../../domain/repository/account.repository.interface';
import { Account } from '../../domain/entity/account.entity';
import { UpsertAccountRequest } from './upsert.account.request';
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
    request: UpsertAccountRequest,
  ): Promise<Either<Error | InvalidAccountDataError, Account>> {
    this.logger.log('Updating account usecase');
    this.logger.log(`Request received: ${JSON.stringify(request)}`);

    const account = Account.create(
      request.name,
      request.accountNumber,
      request.accountBalance,
      request.accountType,
    );

    this.logger.log('Checking if account number already exists');
    const accountExists = await this.accountRepository.findByAccountNumber(
      account.accountNumber,
    );
    if (accountExists.isLeft()) {
      this.logger.error('Error when searching for account by number');
      return left(new Error('It was not possible to retrieve the account'));
    }
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
