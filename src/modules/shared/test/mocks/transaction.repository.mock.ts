import { TransactionRepositoryInterface } from '../../../transaction/domain/repository/transaction.repository.interface';

export const findById: jest.Mock = jest.fn();
export const create: jest.Mock = jest.fn();
export const deleteTransaction: jest.Mock = jest.fn();
export const findByAccountId: jest.Mock = jest.fn();
export const findByDateRange: jest.Mock = jest.fn();
export const updateTransactionStatus: jest.Mock = jest.fn();
export const createScheduledTransaction: jest.Mock = jest.fn();
export const findScheduledTransactionByTransactionId: jest.Mock = jest.fn();
export const updateScheduledTransactionStatus: jest.Mock = jest.fn();

export const fakeTransactionRepository = <TransactionRepositoryInterface>{
  findById,
  findByAccountId,
  findByDateRange,
  create,
  deleteTransaction,
  updateTransactionStatus,
  createScheduledTransaction,
  findScheduledTransactionByTransactionId,
  updateScheduledTransactionStatus,
};
