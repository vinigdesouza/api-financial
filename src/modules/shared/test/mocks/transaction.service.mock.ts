import { TransactionService } from '../../../transaction/domain/services/transaction.service';

export const createScheduledTransaction: jest.Mock = jest.fn();
export const processScheduleTransaction: jest.Mock = jest.fn();

export const fakeTransactionService = <TransactionService>(<unknown>{
  createScheduledTransaction,
  processScheduleTransaction,
});
