import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { CustomLogger } from '../../../shared/custom.logger';

@Injectable()
export class TransactionQueue {
  constructor(
    @InjectQueue('transactionQueue') private readonly queue: Queue,
    private readonly logger: CustomLogger,
  ) {}

  async addTransactionToQueue(transactionId: string, scheduledAt: Date) {
    this.logger.log(
      `Adding transaction ${transactionId} to queue scheduled at ${scheduledAt.toDateString()}`,
    );
    await this.queue.add(
      'processTransaction',
      { transactionId },
      {
        delay: scheduledAt.getTime() - Date.now(),
      },
    );
  }
}
