import { buildAccount } from '../../util/common.faker';
import { faker } from '@faker-js/faker/.';
import { Account, AccountType } from '../../../domain/entity/account.entity';

describe('Entity Account', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2025-02-01'));
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a valid account', () => {
    const account = buildAccount({});

    expect(account).toBeInstanceOf(Account);
    expect(account.name).toBe(account.name);
    expect(account.accountNumber).toBe(account.accountNumber);
    expect(account.accountBalance).toBe(account.accountBalance);
    expect(account.accountType).toBe(account.accountType);
    expect(account.id).toBe(account.id);
    expect(account.createdAt).toBeInstanceOf(Date);
  });

  it('should create a update valid account', () => {
    const idAccount = faker.string.uuid();
    const account = buildAccount({ id: idAccount });

    const accountUpdated = Account.update(
      idAccount,
      account.name,
      account.accountNumber,
      faker.number.int({ min: 1, max: 30000 }),
      AccountType.CONTA_POUPANCA,
      account.createdAt,
    );

    expect(accountUpdated).toBeInstanceOf(Account);
    expect(accountUpdated.id).toBe(idAccount);
    expect(accountUpdated.name).toBe(account.name);
    expect(accountUpdated.accountBalance).toBe(accountUpdated.accountBalance);
    expect(accountUpdated.accountType).toBe(AccountType.CONTA_POUPANCA);
    expect(accountUpdated.updatedAt).toBeInstanceOf(Date);
  });

  it('should return true for allowed account types', () => {
    const account = buildAccount({ accountType: AccountType.CONTA_CORRENTE });
    expect(account.accountTypeAllowed()).toBeTruthy();
  });

  it('should return true for positive account balance', () => {
    const account = buildAccount({ accountBalance: 100 });
    expect(account.accountBalanceIsPositive()).toBeTruthy();
  });

  it('should return false for negative account balance', () => {
    const account = buildAccount({ accountBalance: -100 });
    expect(account.accountBalanceIsPositive()).toBeFalsy();
  });
});
