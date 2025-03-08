import { TransactionRepositoryInterface } from '../../../transaction/domain/repository/transaction.repository.interface';

export const findById: jest.Mock = jest.fn();
export const create: jest.Mock = jest.fn();
export const deleteTransaction: jest.Mock = jest.fn();
export const findByAccountId: jest.Mock = jest.fn();

export const fakeTransactionRepository = <TransactionRepositoryInterface>{
  findById,
  findByAccountId,
  create,
  deleteTransaction,
};
