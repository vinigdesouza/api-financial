import { Either } from '../../../shared/either';
import {
  ScheduledTransaction,
  StatusScheduledTransaction,
} from '../entity/scheduledTransaction.entity';
import { StatusTransaction, Transaction } from '../entity/transaction.entity';

export interface TransactionRepositoryInterface {
  findById(id: string): Promise<Either<Error, Transaction | null>>;
  findByAccountId(accountId: string): Promise<Either<Error, Transaction[]>>;
  findByDateRange(
    startDate: Date,
    endDate: Date,
  ): Promise<Either<Error, Transaction[]>>;
  create(transaction: Transaction): Promise<Either<Error, Transaction>>;
  deleteTransaction(id: string): Promise<Either<Error, null>>;
  updateTransactionStatus(
    id: string,
    status: StatusTransaction,
  ): Promise<Either<Error, null>>;
  createScheduledTransaction(
    scheduledTransaction: ScheduledTransaction,
  ): Promise<Either<Error, ScheduledTransaction>>;
  findScheduledTransactionByTransactionId(
    transactionId: string,
  ): Promise<Either<Error, ScheduledTransaction | null>>;
  updateScheduledTransactionStatus(
    transactionId: string,
    status: StatusScheduledTransaction,
  ): Promise<Either<Error, null>>;
}
