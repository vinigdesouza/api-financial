import { TransactionScheduler } from '../../../transaction/application/scheduled/transaction.scheduler';

export const scheduleTransaction: jest.Mock = jest.fn();

export const fakeTransactionScheduler = <TransactionScheduler>(<unknown>{
  scheduleTransaction,
});
