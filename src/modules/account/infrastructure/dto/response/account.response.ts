import {
  Account,
  AccountType,
} from 'src/modules/account/domain/entity/account.entity';

export class AccountResponse {
  id?: string;
  name: string;
  accountNumber: number;
  accountBalance: number;
  accountType: AccountType;
  createdAt: Date;

  static criar(account: Account): AccountResponse {
    const response = new Account(
      account.name,
      account.accountNumber,
      account.accountBalance,
      account.accountType,
      account.createdAt,
      account.id,
    );

    return response;
  }
}
