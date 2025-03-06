import { AccountRepositoryInterface } from 'src/modules/account/domain/repository/account.repository.interface';

export const findById: jest.Mock = jest.fn();
export const create: jest.Mock = jest.fn();
export const update: jest.Mock = jest.fn();
export const deleteAccount: jest.Mock = jest.fn();
export const findByAccountNumber: jest.Mock = jest.fn();

export const fakeAccountRepository = <AccountRepositoryInterface>{
  findById,
  create,
  update,
  deleteAccount,
  findByAccountNumber,
};
