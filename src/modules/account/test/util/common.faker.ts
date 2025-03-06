import { CustomLogger } from 'src/modules/shared/custom.logger';
import { UpsertAccountRequest } from '../../application/usecase/upsert.account.request';
import { plainToClass } from 'class-transformer';
import { faker } from '@faker-js/faker';
import {
  Account,
  AccountType,
} from '../../domain/entity/account.entity';
// import {
//   Account,
//   AccountType,
// } from 'src/modules/account/domain/entity/account.entity';

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
