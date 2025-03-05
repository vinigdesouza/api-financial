import { IEvent } from '@nestjs/cqrs';

export class TransactionProcessedEvent implements IEvent {
  constructor(
    public readonly accountId: string,
    public readonly amount: number,
    public readonly transactionType: string,
    public readonly destinationAccountId?: string,
  ) {}
}
