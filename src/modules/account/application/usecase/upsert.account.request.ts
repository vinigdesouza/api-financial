import { AccountType } from '../../domain/entity/account.entity';

export class UpsertAccountRequest {
  name: string;
  accountNumber: number;
  accountBalance: number;
  accountType: AccountType;
}
