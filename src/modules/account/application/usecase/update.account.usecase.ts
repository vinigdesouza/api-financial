import { Inject, Injectable } from '@nestjs/common';
import { CustomLogger } from '../../../shared/custom.logger';
import { AccountRepositoryInterface } from '../../domain/repository/account.repository.interface';
import { Account } from '../../domain/entity/account.entity';
import { UpsertAccountRequest } from './upsert.account.request';
import { Either, left, right } from '../../../shared/either';
import { InvalidAccountDataError } from '../exceptions/InvalidAccountDataError';
import { AccountDoesNotExist } from '../exceptions/AccountDoesNotExist';

@Injectable()
export class UpdateAccountUsecase {
  constructor(
    @Inject('AccountRepositoryInterface')
    private readonly accountRepository: AccountRepositoryInterface,
    private readonly logger: CustomLogger,
  ) {}

  async handle(
    idAccount: string,
    request: UpsertAccountRequest,
  ): Promise<
    Either<Error | InvalidAccountDataError | AccountDoesNotExist, Account>
  > {
    this.logger.log('Creating account usecase');
    this.logger.log(`Request received: ${JSON.stringify(request)}`);

    this.logger.log(`Finding account by id: ${idAccount}`);
    const accountExists = await this.accountRepository.findById(idAccount);

    if (accountExists.isLeft()) {
      this.logger.error(
        'It was not possible to retrieve the account',
        accountExists.value.message,
      );
      return left(new Error(accountExists.value.message));
    }

    if (!accountExists.value) {
      this.logger.warn(`Account with id ${idAccount} not found`);
      return left(new AccountDoesNotExist());
    }

    const account = accountExists.value;

    this.logger.log('Checking if account number already exists');
    const accountNumberExists =
      await this.accountRepository.findByAccountNumber(request.accountNumber);

    if (accountNumberExists.isLeft()) {
      console.log('entrou aqui');
      this.logger.error('Error when searching for account by number');
      return left(new Error('It was not possible to retrieve the account'));
    }

    if (
      accountNumberExists.value !== null &&
      accountNumberExists.value.id !== idAccount
    ) {
      this.logger.error('Account number already exists');
      return left(new InvalidAccountDataError('Account already exists'));
    }

    this.logger.log('Updating account');
    const accountUpdated = await this.accountRepository.update(
      Account.update(
        idAccount,
        request.name,
        request.accountNumber,
        request.accountBalance,
        request.accountType,
        account.createdAt,
      ),
    );
    if (accountUpdated.isLeft()) {
      this.logger.error(
        'Error when updating account',
        accountUpdated.value.message,
      );
      return left(accountUpdated.value);
    }

    return right(accountUpdated.value);
  }
}
