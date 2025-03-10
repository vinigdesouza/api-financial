import { Inject, Injectable } from '@nestjs/common';
import { TransactionRepositoryInterface } from '../repository/transaction.repository.interface';
import { CustomLogger } from '../../../shared/custom.logger';
import { TransactionScheduler } from '../../application/scheduled/transaction.scheduler';
import {
  ScheduledTransaction,
  StatusScheduledTransaction,
} from '../entity/scheduledTransaction.entity';
import { TransactionProcessedEvent } from '../../application/events/transaction-created.event';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Either, left, right } from '../../../shared/either';

@Injectable()
export class TransactionService {
  constructor(
    @Inject('TransactionRepositoryInterface')
    private readonly transactionRepository: TransactionRepositoryInterface,
    private readonly transactionScheduler: TransactionScheduler,
    private readonly eventEmitter: EventEmitter2,
    private readonly logger: CustomLogger,
  ) {}

  async createScheduledTransaction(
    transactionId: string,
    scheduledAt: Date,
  ): Promise<Either<Error, undefined>> {
    this.logger.log(
      `Creating scheduled transaction, transactionId: ${transactionId}`,
    );
    const createScheduledTransaction =
      await this.transactionRepository.createScheduledTransaction(
        ScheduledTransaction.create(
          transactionId,
          scheduledAt,
          StatusScheduledTransaction.PENDING,
        ),
      );

    if (createScheduledTransaction.isLeft()) {
      this.logger.error('Error creating scheduled transaction');
      return left(new Error(createScheduledTransaction.value.message));
    }

    await this.transactionScheduler.scheduleTransaction(
      transactionId,
      scheduledAt,
    );

    return right(undefined);
  }

  async processScheduleTransaction(transactionId: string): Promise<void> {
    this.logger.log('Finding transaction');
    const transaction =
      await this.transactionRepository.findById(transactionId);

    if (transaction.isLeft()) {
      this.logger.error(
        `Transaction not found, error: ${transaction.value.message}`,
      );
      return undefined;
    }
    if (transaction.value === null) {
      this.logger.error('Transaction not found');
      return undefined;
    }

    this.logger.log('Finding schedule transaction');
    const scheduleTransaction =
      await this.transactionRepository.findScheduledTransactionByTransactionId(
        transactionId,
      );
    if (scheduleTransaction.isLeft()) {
      this.logger.error('Schedule transaction not found');
      return undefined;
    }
    if (scheduleTransaction.value === null) {
      this.logger.error('Schedule transaction not found');
      return undefined;
    }

    this.logger.log('Verifing schedule transaction status');
    if (
      scheduleTransaction.value.status !== StatusScheduledTransaction.PENDING
    ) {
      this.logger.error('Schedule transaction is not pending');
      return undefined;
    }

    this.logger.log('Verifing schedule transaction date');
    if (scheduleTransaction.value.scheduledAt > new Date()) {
      this.logger.error('Schedule transaction is not due');
      return undefined;
    }

    this.logger.log('Updating schedule transaction status');
    const scheduledTransactionUpdated =
      await this.transactionRepository.updateScheduledTransactionStatus(
        transactionId,
        StatusScheduledTransaction.PROCESSED,
      );

    if (scheduledTransactionUpdated.isLeft()) {
      this.logger.error('Error updating scheduled transaction');
      return undefined;
    }

    this.logger.log('Processing transaction');
    this.eventEmitter.emit(
      'transaction.processed',
      new TransactionProcessedEvent(
        transaction.value.accountId,
        transactionId,
        transaction.value.amount,
        transaction.value.transactionType,
        transaction.value.destinationAccountId,
      ),
    );
  }
}
