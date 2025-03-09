import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { TransactionProcessedEvent } from '../events/transaction-created.event';
import { AccountRepositoryInterface } from '../../../account/domain/repository/account.repository.interface';
import { Account } from '../../../account/domain/entity/account.entity';
import { CustomLogger } from '../../../shared/custom.logger';
import { TransactionRepositoryInterface } from '../../domain/repository/transaction.repository.interface';
import { StatusTransaction } from '../../domain/entity/transaction.entity';

@Injectable()
export class TransactionListener {
  constructor(
    @Inject('AccountRepositoryInterface')
    private readonly accountRepository: AccountRepositoryInterface,
    @Inject('TransactionRepositoryInterface')
    private readonly transactionRepository: TransactionRepositoryInterface,
    private readonly logger: CustomLogger,
  ) {}

  @OnEvent('transaction.processed')
  async handleTransactionProcessed(event: TransactionProcessedEvent) {
    this.logger.log(
      `Handling TransactionProcessedEvent for account ${event.accountId}`,
    );

    const {
      accountId,
      transactionId,
      amount,
      transactionType,
      destinationAccountId,
    } = event;

    const accountResult = await this.accountRepository.findById(accountId);
    if (accountResult.isLeft() || !accountResult.value) return undefined;

    const account = accountResult.value;

    let newAccountBalance = account.accountBalance;

    if (transactionType === 'WITHDRAW' || transactionType === 'TRANSFER') {
      newAccountBalance -= amount;
    } else if (transactionType === 'DEPOSIT') {
      newAccountBalance += amount;
    }

    await this.accountRepository.update(
      Account.update(
        accountId,
        account.name,
        account.accountNumber,
        Number(newAccountBalance),
        account.accountType,
        account.createdAt,
      ),
    );

    if (destinationAccountId && transactionType === 'TRANSFER') {
      const destinationAccount =
        await this.accountRepository.findById(destinationAccountId);
      if (destinationAccount.isLeft() || !destinationAccount.value)
        return undefined;

      const newAccountBalanceDestination =
        Number(event.amount) + Number(destinationAccount.value.accountBalance);

      this.logger.log(
        `Updating destination account ${destinationAccountId} with new balance ${newAccountBalanceDestination}`,
      );

      await this.accountRepository.update(
        Account.update(
          destinationAccountId,
          destinationAccount.value.name,
          destinationAccount.value.accountNumber,
          newAccountBalanceDestination,
          destinationAccount.value.accountType,
          destinationAccount.value.createdAt,
        ),
      );
    }

    await this.transactionRepository.updateTransactionStatus(
      transactionId,
      StatusTransaction.COMPLETED,
    );
  }
}
