export class TransactionProcessedEvent {
  constructor(
    public readonly accountId: string,
    public readonly transactionId: string,
    public readonly amount: number,
    public readonly transactionType: string,
    public readonly destinationAccountId?: string,
  ) {}
}
