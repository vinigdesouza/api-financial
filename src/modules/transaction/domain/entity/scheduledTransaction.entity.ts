export enum StatusScheduledTransaction {
  PENDING = 'PENDING',
  PROCESSED = 'PROCESSED',
}

export class ScheduledTransaction {
  constructor(
    public readonly transactionId: string,
    public readonly scheduledAt: Date,
    public readonly status: StatusScheduledTransaction,
    public readonly createdAt: Date,
    public readonly id?: string,
    public readonly updatedAt?: Date,
  ) {}

  static create(
    transactionId: string,
    scheduledAt: Date,
    status: StatusScheduledTransaction,
  ): ScheduledTransaction {
    return new ScheduledTransaction(
      transactionId,
      scheduledAt,
      status,
      new Date(),
    );
  }
}
