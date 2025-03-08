import { CustomLogger } from '../custom.logger';
import { plainToClass } from 'class-transformer';
import { faker } from '@faker-js/faker';
import {
  CurrencyTypes,
  StatusTransaction,
  Transaction,
  TransactionType,
} from '../../transaction/domain/entity/transaction.entity';
import TransactionModel from '../../transaction/infrastructure/models/transaction.model';
import { CreateTransactionDTO } from '../../transaction/infrastructure/dto/create.transaction.dto';

export const fakeLogger: Partial<CustomLogger> = {
  verbose: jest.fn(),
  debug: jest.fn(),
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

export const buildCreateTransactionDTO = (
  partial: Partial<CreateTransactionDTO>,
): CreateTransactionDTO => {
  const data: CreateTransactionDTO = plainToClass(CreateTransactionDTO, {
    ...{
      account_id: faker.string.uuid(),
      amount: faker.number.int({ min: 1, max: 3000 }),
      transaction_type: TransactionType.DEPOSIT,
      currency: CurrencyTypes.REAL,
    },
    ...partial,
  });
  return data;
};

export const buildTransaction = (
  partial: Partial<Transaction>,
): Transaction => {
  const data: Transaction = plainToClass(Transaction, {
    ...{
      accountId: faker.string.uuid(),
      amount: faker.number.int({ min: 1, max: 3000 }),
      transactionType: TransactionType.DEPOSIT,
      status: StatusTransaction.COMPLETED,
      id: faker.string.uuid(),
      updatedAt: new Date(),
      createdAt: new Date(),
    },
    ...partial,
  });
  return data;
};

export const buildTransactionModel = (
  partial: Partial<TransactionModel>,
): TransactionModel => {
  const data: TransactionModel = plainToClass(TransactionModel, {
    ...{
      account_id: faker.string.uuid(),
      amount: faker.number.int({ min: 1, max: 3000 }),
      transaction_type: TransactionType.DEPOSIT,
      status: StatusTransaction.COMPLETED,
      id: faker.string.uuid(),
      updated_at: new Date(),
      created_at: new Date(),
    },
    ...partial,
  });
  return data;
};
