import { AccountType } from '../../domain/entity/account.entity';

export type UpsertAccountRequest = {
  name: string;
  accountNumber: number;
  accountBalance: number;
  accountType: AccountType;
};
