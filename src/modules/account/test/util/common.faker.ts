import { CustomLogger } from '../../../shared/custom.logger';
import { UpsertAccountRequest } from '../../application/usecase/upsert.account.request';
import { plainToClass } from 'class-transformer';
import { faker } from '@faker-js/faker';
import { Account, AccountType } from '../../domain/entity/account.entity';
import { CreateAccountDTO } from '../../infrastructure/dto/request/create.account.dto';
import AccountModel from '../../infrastructure/models/account.model';

export const fakeLogger: Partial<CustomLogger> = {
  verbose: jest.fn(),
  debug: jest.fn(),
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

export const buildUpsertAccountRequest = (
  partial: Partial<UpsertAccountRequest>,
): UpsertAccountRequest => {
  const data: UpsertAccountRequest = plainToClass(UpsertAccountRequest, {
    ...{
      name: faker.lorem.words(),
      accountNumber: faker.number.int({ min: 1, max: 3000 }),
      accountBalance: faker.number.int({ min: 1, max: 30000 }),
      accountType: AccountType.CONTA_CORRENTE,
    },
    ...partial,
  });
  return data;
};

export const buildCreateAccountDTO = (
  partial: Partial<CreateAccountDTO>,
): CreateAccountDTO => {
  const data: CreateAccountDTO = plainToClass(CreateAccountDTO, {
    ...{
      name: faker.lorem.words(),
      account_number: faker.number.int({ min: 1, max: 3000 }),
      account_balance: faker.number.int({ min: 1, max: 30000 }),
      account_type: AccountType.CONTA_CORRENTE,
    },
    ...partial,
  });
  return data;
};

export const buildAccount = (partial: Partial<Account>): Account => {
  const data: Account = plainToClass(Account, {
    ...{
      name: faker.lorem.words(),
      accountNumber: faker.number.int({ min: 1, max: 3000 }),
      accountBalance: faker.number.int({ min: 1, max: 30000 }),
      accountType: AccountType.CONTA_CORRENTE,
      createdAt: new Date(),
      id: faker.string.uuid(),
      updatedAt: new Date(),
    },
    ...partial,
  });
  return data;
};

export const buildAccountModel = (
  partial: Partial<AccountModel>,
): AccountModel => {
  const data: AccountModel = plainToClass(AccountModel, {
    ...{
      name: faker.lorem.word(),
      account_number: faker.number.int({ min: 1, max: 3000 }),
      account_balance: faker.number.int({ min: 1, max: 30000 }),
      account_type: AccountType.CONTA_CORRENTE,
      created_at: new Date(),
      id: faker.string.uuid(),
      updated_at: new Date(),
    },
    ...partial,
  });
  return data;
};
