import { Account, AccountType } from '../../domain/entity/account.entity';

export class AccountResponse {
  id: string;
  name: string;
  accountNumber: number;
  accountBalance: number;
  accountType: AccountType;
  createdAt: Date;

  static criar(account: Account): AccountResponse {
    const response = new Account(
      account.id,
      account.name,
      account.accountNumber,
      account.accountBalance,
      account.accountType,
      account.createdAt,
    );

    return response;
  }
}
