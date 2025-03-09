import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';

@Injectable()
export class TransactionQueue {
  constructor(@InjectQueue('transactionQueue') private readonly queue: Queue) {}

  async addTransactionToQueue(transactionId: string, scheduledAt: Date) {
    await this.queue.add(
      'processTransaction',
      { transactionId },
      {
        delay: scheduledAt.getTime() - Date.now(),
      },
    );
  }
}
