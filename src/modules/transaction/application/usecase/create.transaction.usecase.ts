import { Inject, Injectable } from '@nestjs/common';
import { TransactionRepositoryInterface } from '../../domain/repository/transaction.repository.interface';
import { CustomLogger } from '../../../shared/custom.logger';
import { CreateTransactionDTO } from '../../infrastructure/dto/create.transaction.dto';
import {
  CurrencyTypes,
  StatusTransaction,
  Transaction,
  TransactionType,
} from '../../domain/entity/transaction.entity';
import { Either, left, right } from '../../../shared/either';
import { AccountRepositoryInterface } from '../../../account/domain/repository/account.repository.interface';
import { AccountDoesNotExist } from '../../../account/application/exceptions/AccountDoesNotExist';
import { BalanceInsufficient } from '../exceptions/BalanceInsufficient';
import { TransactionProcessedEvent } from '../events/transaction-created.event';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CurrencyConversionService } from '../../domain/services/CurrencyConversionService';

@Injectable()
export class CreateTransactionUsecase {
  constructor(
    @Inject('TransactionRepositoryInterface')
    private readonly transactionRepository: TransactionRepositoryInterface,
    @Inject('AccountRepositoryInterface')
    private readonly accountRepository: AccountRepositoryInterface,
    private readonly CurrencyConversionService: CurrencyConversionService,
    private readonly logger: CustomLogger,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async handle(
    request: CreateTransactionDTO,
  ): Promise<
    Either<Error | AccountDoesNotExist | BalanceInsufficient, Transaction>
  > {
    this.logger.log('Creating transaction usecase');
    this.logger.log(`Request received: ${JSON.stringify(request)}`);

    const idAccount = request.account_id;
    const idAccountDestination = request.destination_account_id;
    let amount = request.amount;
    const transactionType = request.transaction_type;
    const currency = request.currency;

    if (currency !== CurrencyTypes.REAL) {
      const newAmount = await this.CurrencyConversionService.convertCurrency(
        amount,
        currency,
        CurrencyTypes.REAL,
      );

      if (newAmount.isLeft()) {
        this.logger.error('Error converting currency');
        return left(new Error('Error converting currency'));
      }

      amount = newAmount.value;
    }

    this.logger.log(`Finding origin account by id: ${idAccount}`);
    const accountOriginExists =
      await this.accountRepository.findById(idAccount);
    if (accountOriginExists.isLeft()) {
      this.logger.error(
        'It was not possible to retrieve the origin account',
        accountOriginExists.value.message,
      );
      return left(new Error(accountOriginExists.value.message));
    }
    if (!accountOriginExists.value) {
      this.logger.warn(`Origin account with id ${idAccount} not found`);
      return left(new AccountDoesNotExist());
    }

    if (idAccountDestination) {
      this.logger.log(
        `Finding destination account by id: ${idAccountDestination}`,
      );
      const accountDestinationExists =
        await this.accountRepository.findById(idAccountDestination);

      if (accountDestinationExists.isLeft()) {
        this.logger.error(
          'It was not possible to retrieve the destination account',
          accountDestinationExists.value.message,
        );
        return left(new Error(accountDestinationExists.value.message));
      }

      if (!accountDestinationExists.value) {
        this.logger.warn(
          `Destination account with id ${idAccountDestination} not found`,
        );
        return left(new AccountDoesNotExist());
      }
    }

    if (
      [TransactionType.TRANSFER, TransactionType.WITHDRAW].includes(
        transactionType,
      )
    ) {
      if (accountOriginExists.value.accountBalance < amount) {
        this.logger.error('Insufficient balance to make the transaction');
        return left(new BalanceInsufficient());
      }
    }

    const transaction = Transaction.create(
      idAccount,
      amount,
      transactionType,
      StatusTransaction.COMPLETED,
      request.description,
      idAccountDestination,
    );

    this.logger.log('Creating transaction');
    const transactionCreated =
      await this.transactionRepository.create(transaction);
    if (transactionCreated.isLeft()) {
      this.logger.error(
        'Error when creating transaction',
        transactionCreated.value.message,
      );
      return left(transactionCreated.value);
    }

    this.eventEmitter.emit(
      'transaction.processed',
      new TransactionProcessedEvent(
        idAccount,
        amount,
        transactionType,
        idAccountDestination,
      ),
    );

    return right(transactionCreated.value);
  }
}
