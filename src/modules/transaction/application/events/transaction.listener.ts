import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { TransactionProcessedEvent } from './transaction-created.event';
import { AccountRepositoryInterface } from 'src/modules/account/domain/repository/account.repository.interface';
import { Inject, Injectable } from '@nestjs/common';
import { Account } from 'src/modules/account/domain/entity/account.entity';
import { CustomLogger } from 'src/modules/shared/custom.logger';

@Injectable()
@EventsHandler(TransactionProcessedEvent)
export class TransactionListener
  implements IEventHandler<TransactionProcessedEvent>
{
  constructor(
    @Inject('AccountRepositoryInterface')
    private readonly accountRepository: AccountRepositoryInterface,
    private readonly logger: CustomLogger,
  ) {}

  async handle(event: TransactionProcessedEvent) {
    this.logger.log(
      `Handling TransactionProcessedEvent for account ${event.accountId}`,
    );

    const { accountId, amount, transactionType, destinationAccountId } = event;

    const accountResult = await this.accountRepository.findById(accountId);
    if (accountResult.isLeft() || !accountResult.value) return;

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
        newAccountBalance,
        account.accountType,
        account.createdAt,
      ),
    );

    if (destinationAccountId && transactionType === 'TRANSFER') {
      const destinationAccount =
        await this.accountRepository.findById(destinationAccountId);
      if (destinationAccount.isLeft() || !destinationAccount.value) return;

      const newAccountBalanceDestination =
        event.amount + destinationAccount.value.accountBalance;

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
  }
}
