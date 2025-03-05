import { AccountType } from '../../domain/entity/account.entity';

export type CreateAccountRequest = {
  name: string;
  accountNumber: number;
  accountBalance: number;
  accountType: AccountType;
};
