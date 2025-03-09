import { Injectable } from '@nestjs/common';
import { TransactionQueue } from './transaction.queue';

@Injectable()
export class TransactionScheduler {
  constructor(private readonly transactionQueue: TransactionQueue) {}

  async scheduleTransaction(transactionId: string, scheduledAt: Date) {
    await this.transactionQueue.addTransactionToQueue(
      transactionId,
      scheduledAt,
    );
  }
}
