import { Transaction } from '../../../transaction/domain/entity/transaction.entity';

export enum AccountType {
  CONTA_CORRENTE = 'CONTA CORRENTE',
  CONTA_POUPANCA = 'CONTA POUPANCA',
}

export type StatementFilters = {
  accountNumber: number;
  startDate: Date;
  endDate: Date;
  accountId?: string;
  transactionType?: string;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
};

export class Account {
  private transactions: Transaction[] = [];

  constructor(
    public readonly name: string,
    public readonly accountNumber: number,
    public readonly accountBalance: number,
    public readonly accountType: AccountType,
    public readonly createdAt: Date,
    public readonly id?: string,
    public readonly updatedAt?: Date,
  ) {}

  adicionarTransaction(transaction: Transaction): void {
    this.transactions.push(transaction);
  }

  static create(
    name: string,
    accountNumber: number,
    accountBalance: number,
    accountType: AccountType,
    id?: string,
    updatedAt?: Date,
  ): Account {
    return new Account(
      name,
      accountNumber,
      accountBalance,
      accountType,
      new Date(),
      id,
      updatedAt,
    );
  }

  static update(
    id: string,
    name: string,
    accountNumber: number,
    accountBalance: number,
    accountType: AccountType,
    createdAt: Date,
  ): Account {
    return new Account(
      name,
      accountNumber,
      accountBalance,
      accountType,
      createdAt,
      id,
      new Date(),
    );
  }

  accountTypeAllowed(): boolean {
    return [AccountType.CONTA_CORRENTE, AccountType.CONTA_POUPANCA].includes(
      this.accountType,
    );
  }

  accountBalanceIsPositive(): boolean {
    return this.accountBalance >= 0;
  }
}
