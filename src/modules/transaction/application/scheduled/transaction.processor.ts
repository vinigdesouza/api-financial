import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { TransactionService } from '../../domain/services/transaction.service';

@Processor('transactionQueue')
export class TransactionProcessor extends WorkerHost {
  constructor(private readonly transactionService: TransactionService) {
    super();
  }

  async process(job: Job<{ transactionId: string }>) {
    console.log(`Processing transaction ${job.data.transactionId}`);
    await this.transactionService.processTransaction(job.data.transactionId);
  }
}
