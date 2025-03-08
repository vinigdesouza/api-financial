import { Test, TestingModule } from '@nestjs/testing';
import { CustomLogger } from '../../../../shared/custom.logger';
import { left, right } from '../../../../shared/either';
import { faker } from '@faker-js/faker/.';
import {
  buildAccount,
  buildTransactionProcessedEvent,
  fakeLogger,
} from '../../../../shared/test/common.faker';
import {
  CurrencyTypes,
  TransactionType,
} from '../../../../transaction/domain/entity/transaction.entity';
import { TransactionListener } from '../../../../transaction/application/events/transaction.listener';
import {
  fakeAccountRepository,
  findById,
  update,
} from '../../../../shared/test/mocks/account.repository.mock';

describe('CurrencyGateway', () => {
  let listener: TransactionListener;

  beforeEach(async () => {
    jest.useFakeTimers().setSystemTime(new Date('2025-02-01'));

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionListener,
        {
          provide: 'AccountRepositoryInterface',
          useValue: fakeAccountRepository,
        },
        {
          provide: CustomLogger,
          useValue: fakeLogger,
        },
      ],
    }).compile();

    listener = module.get<TransactionListener>(TransactionListener);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return undefined account does not exists', async () => {
    const errorMessage = faker.lorem.words();
    const event = buildTransactionProcessedEvent({});

    findById.mockResolvedValueOnce(left(new Error(errorMessage)));

    await expect(
      listener.handleTransactionProcessed(event),
    ).resolves.toStrictEqual(undefined);
    expect(findById).toHaveBeenCalledTimes(1);
    expect(findById).toHaveBeenCalledWith(event.accountId);
  });

  it('should update account when transaction type WITHDRAW', async () => {
    const event = buildTransactionProcessedEvent({
      transactionType: TransactionType.WITHDRAW,
    });

    const account = buildAccount({
      id: event.accountId,
    });
    const accountUpdated = buildAccount({
      ...account,
      accountBalance: account.accountBalance - event.amount,
    });

    findById.mockResolvedValueOnce(right(account));
    update.mockResolvedValueOnce(right(accountUpdated));

    await expect(
      listener.handleTransactionProcessed(event),
    ).resolves.toStrictEqual(undefined);
    expect(findById).toHaveBeenCalledTimes(1);
    expect(findById).toHaveBeenCalledWith(event.accountId);
  });

  it('should update account when transaction type DEPOSIT', async () => {
    const event = buildTransactionProcessedEvent({
      transactionType: TransactionType.DEPOSIT,
    });

    const account = buildAccount({
      id: event.accountId,
    });
    const accountUpdated = buildAccount({
      ...account,
      accountBalance: account.accountBalance + event.amount,
    });

    findById.mockResolvedValueOnce(right(account));
    update.mockResolvedValueOnce(right(accountUpdated));

    await expect(
      listener.handleTransactionProcessed(event),
    ).resolves.toStrictEqual(undefined);
    expect(findById).toHaveBeenCalledTimes(1);
    expect(findById.mock.calls[0][0]).toStrictEqual(event.accountId);
    expect(update).toHaveBeenCalledTimes(1);
    expect(update.mock.calls[0][0]).toStrictEqual(accountUpdated);
  });

  it('should update main account and destination account when transaction type TRANSFER', async () => {
    const event = buildTransactionProcessedEvent({
      accountId: faker.string.uuid(),
      amount: 100,
      transactionType: TransactionType.TRANSFER,
      destinationAccountId: faker.string.uuid(),
    });

    const mainAccount = buildAccount({
      id: event.accountId,
      accountBalance: 1000,
    });
    const mainAccountUpdated = buildAccount({
      ...mainAccount,
      accountBalance: mainAccount.accountBalance - event.amount,
    });

    const destinationAccount = buildAccount({
      id: event.destinationAccountId,
      accountBalance: 2000,
    });
    const destinationAccountUpdated = buildAccount({
      ...destinationAccount,
      accountBalance: destinationAccount.accountBalance + event.amount,
    });

    findById
      .mockImplementationOnce(() => right(mainAccount))
      .mockImplementationOnce(() => right(destinationAccount));
    update
      .mockImplementationOnce(() => right(mainAccountUpdated))
      .mockImplementationOnce(() => right(destinationAccountUpdated));

    await expect(
      listener.handleTransactionProcessed(event),
    ).resolves.toStrictEqual(undefined);
    expect(findById).toHaveBeenCalledTimes(2);
    expect(findById.mock.calls[0][0]).toBe(event.accountId);
    expect(findById.mock.calls[1][0]).toBe(event.destinationAccountId);
    expect(update).toHaveBeenCalledTimes(2);
    expect(update.mock.calls[0][0]).toStrictEqual(mainAccountUpdated);
    expect(update.mock.calls[1][0]).toStrictEqual(destinationAccountUpdated);
  });
});
