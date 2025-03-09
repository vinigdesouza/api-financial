import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { TransactionService } from '../../domain/services/transaction.service';
import { CustomLogger } from '../../../shared/custom.logger';

@Processor('transactionQueue')
export class TransactionProcessor extends WorkerHost {
  constructor(
    private readonly transactionService: TransactionService,
    private readonly logger: CustomLogger,
  ) {
    super();
  }

  async process(job: Job<{ transactionId: string }>) {
    this.logger.log(`Processing transaction ${job.data.transactionId}`);
    await this.transactionService.processScheduleTransaction(
      job.data.transactionId,
    );
  }
}
