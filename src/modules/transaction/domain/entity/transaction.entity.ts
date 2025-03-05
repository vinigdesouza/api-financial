export enum TransactionType {
  DEPOSIT = 'DEPOSIT',
  WITHDRAW = 'WITHDRAW',
  TRANSFER = 'TRANSFER',
}

export enum CurrencyTypes {
  REAL = 'BRL',
  AMERICAN_DOLLAR = 'USD',
  EURO = 'EUR',
}

export enum StatusTransaction {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export class Transaction {
  constructor(
    public readonly accountId: string,
    public readonly amount: number,
    public readonly transactionType: TransactionType,
    public readonly status: StatusTransaction,
    public readonly createdAt: Date,
    public readonly description?: string,
    public readonly destinationAccountId?: string,
    public readonly id?: string,
    public readonly updatedAt?: Date,
  ) {}

  static create(
    accountId: string,
    amount: number,
    transactionType: TransactionType,
    status: StatusTransaction,
    description?: string,
    destinationAccountId?: string,
  ): Transaction {
    return new Transaction(
      accountId,
      amount,
      transactionType,
      status,
      new Date(),
      description,
      destinationAccountId,
    );
  }
}
