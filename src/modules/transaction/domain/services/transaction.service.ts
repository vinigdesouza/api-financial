import { Inject, Injectable } from '@nestjs/common';
import { TransactionRepositoryInterface } from '../repository/transaction.repository.interface';
import { CustomLogger } from '../../../shared/custom.logger';
import { TransactionScheduler } from '../../application/scheduled/transaction.scheduler';

@Injectable()
export class TransactionService {
  constructor(
    @Inject('TransactionRepositoryInterface')
    private readonly transactionRepository: TransactionRepositoryInterface,
    private readonly transactionScheduler: TransactionScheduler,
    private readonly logger: CustomLogger,
  ) {}

  async createScheduledTransaction(transactionId: string, scheduledAt: Date) {
    await this.transactionScheduler.scheduleTransaction(
      transactionId,
      scheduledAt,
    );
  }

  async processTransaction(transactionId: string): Promise<void> {
    const transaction =
      await this.transactionRepository.findById(transactionId);
    if (transaction.isLeft()) {
      this.logger.error('Transaction not found');
      return undefined;
    }
    // Adicione aqui a lógica de processamento
  }
}
