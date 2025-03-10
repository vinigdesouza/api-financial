import { Test, TestingModule } from '@nestjs/testing';
import { CustomLogger } from '../../../../shared/custom.logger';
import { left, right } from '../../../../shared/either';
import { faker } from '@faker-js/faker/.';
import { CreateTransactionUsecase } from '../../../application/usecase/create.transaction.usecase';
import {
  buildAccount,
  buildCreateTransactionDTO,
  buildTransaction,
  fakeLogger,
} from '../../../../shared/test/common.faker';
import {
  create,
  fakeTransactionRepository,
} from '../../../../shared/test/mocks/transaction.repository.mock';
import {
  fakeAccountRepository,
  findById as findByIdAccount,
} from '../../../../shared/test/mocks/account.repository.mock';
import { CurrencyConversionService } from '../../../../transaction/domain/services/currency.conversion.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  convertCurrency,
  fakeCurrencyConversionService,
} from '../../../../shared/test/mocks/currency.service.mock';
import {
  emit,
  fakeEventEmitter2,
} from '../../../../shared/test/mocks/eventEmitter.mock';
import {
  CurrencyTypes,
  StatusTransaction,
  TransactionType,
} from '../../../../transaction/domain/entity/transaction.entity';
import { AccountDoesNotExist } from '../../../../account/application/exceptions/AccountDoesNotExist';
import { BalanceInsufficient } from '../../../application/exceptions/BalanceInsufficient';
import { TransactionService } from '../../../../transaction/domain/services/transaction.service';
import {
  createScheduledTransaction,
  fakeTransactionService,
} from '../../../../shared/test/mocks/transaction.service.mock';

describe('CreateTransactionUsecase', () => {
  let useCase: CreateTransactionUsecase;

  beforeEach(async () => {
    jest.useFakeTimers().setSystemTime(new Date('2025-02-01'));

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateTransactionUsecase,
        {
          provide: 'TransactionRepositoryInterface',
          useValue: fakeTransactionRepository,
        },
        {
          provide: 'AccountRepositoryInterface',
          useValue: fakeAccountRepository,
        },
        {
          provide: CurrencyConversionService,
          useValue: fakeCurrencyConversionService,
        },
        {
          provide: TransactionService,
          useValue: fakeTransactionService,
        },
        {
          provide: CustomLogger,
          useValue: fakeLogger,
        },
        {
          provide: EventEmitter2,
          useValue: fakeEventEmitter2,
        },
      ],
    }).compile();

    useCase = module.get<CreateTransactionUsecase>(CreateTransactionUsecase);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return an error when conversion currency return error ', async () => {
    const errorMesssage = faker.lorem.words();
    const request = buildCreateTransactionDTO({
      currency: CurrencyTypes.AMERICAN_DOLLAR,
    });

    convertCurrency.mockResolvedValueOnce(left(new Error(errorMesssage)));

    const result = await useCase.handle(request);
    expect(result).toEqual(left(new Error('Error converting currency')));
    expect(convertCurrency).toHaveBeenCalledTimes(1);
    expect(convertCurrency.mock.calls[0][0]).toStrictEqual(request.amount);
    expect(convertCurrency.mock.calls[0][1]).toStrictEqual(request.currency);
    expect(convertCurrency.mock.calls[0][2]).toStrictEqual(CurrencyTypes.REAL);
  });

  it('should return an error when account repository method findById() fails', async () => {
    const errorMesssage = faker.lorem.words();
    const request = buildCreateTransactionDTO({
      currency: CurrencyTypes.AMERICAN_DOLLAR,
    });

    convertCurrency.mockResolvedValueOnce(right(100));
    findByIdAccount.mockResolvedValueOnce(left(new Error(errorMesssage)));

    const result = await useCase.handle(request);
    expect(result).toEqual(left(new Error(errorMesssage)));
    expect(convertCurrency).toHaveBeenCalledTimes(1);
    expect(convertCurrency.mock.calls[0][0]).toStrictEqual(request.amount);
    expect(convertCurrency.mock.calls[0][1]).toStrictEqual(request.currency);
    expect(convertCurrency.mock.calls[0][2]).toStrictEqual(CurrencyTypes.REAL);
    expect(findByIdAccount).toHaveBeenCalledTimes(1);
    expect(findByIdAccount.mock.calls[0][0]).toStrictEqual(request.account_id);
  });

  it('should return an AccountDoesNotExist when account repository method findById() return null', async () => {
    const request = buildCreateTransactionDTO({
      currency: CurrencyTypes.REAL,
    });

    findByIdAccount.mockResolvedValueOnce(right(null));

    const result = await useCase.handle(request);
    expect(result).toEqual(left(new AccountDoesNotExist()));
    expect(convertCurrency).toHaveBeenCalledTimes(0);
    expect(findByIdAccount).toHaveBeenCalledTimes(1);
    expect(findByIdAccount.mock.calls[0][0]).toStrictEqual(request.account_id);
  });

  it('should return an error when account repository method findById() account destination fails', async () => {
    const errorMesssage = faker.lorem.words();
    const request = buildCreateTransactionDTO({
      transaction_type: TransactionType.TRANSFER,
      destination_account_id: faker.string.uuid(),
      currency: CurrencyTypes.REAL,
    });

    findByIdAccount.mockImplementation((id) => {
      if (id === request.account_id) {
        return right({ id: request.account_id });
      }
      return left(new Error(errorMesssage));
    });

    const result = await useCase.handle(request);
    expect(result).toEqual(left(new Error(errorMesssage)));
    expect(convertCurrency).toHaveBeenCalledTimes(0);
    expect(findByIdAccount).toHaveBeenCalledTimes(2);
    expect(findByIdAccount.mock.calls[0][0]).toStrictEqual(request.account_id);
    expect(findByIdAccount.mock.calls[1][0]).toStrictEqual(
      request.destination_account_id,
    );
  });

  it('should return an AccountDoesNotExist when account repository method findById() account destination return null', async () => {
    const request = buildCreateTransactionDTO({
      transaction_type: TransactionType.TRANSFER,
      destination_account_id: faker.string.uuid(),
      currency: CurrencyTypes.REAL,
    });

    findByIdAccount.mockImplementation((id) => {
      if (id === request.account_id) {
        return right({ id: request.account_id });
      }
      return right(null);
    });

    const result = await useCase.handle(request);
    expect(result).toEqual(left(new AccountDoesNotExist()));
    expect(convertCurrency).toHaveBeenCalledTimes(0);
    expect(findByIdAccount).toHaveBeenCalledTimes(2);
    expect(findByIdAccount.mock.calls[0][0]).toStrictEqual(request.account_id);
    expect(findByIdAccount.mock.calls[1][0]).toStrictEqual(
      request.destination_account_id,
    );
  });

  it('should return an BalanceInsufficient when balance insufficient to make the transaction', async () => {
    const request = buildCreateTransactionDTO({
      amount: 200,
      transaction_type: TransactionType.WITHDRAW,
      currency: CurrencyTypes.REAL,
    });

    findByIdAccount.mockResolvedValueOnce(
      right(buildAccount({ id: request.account_id, accountBalance: 100 })),
    );

    const result = await useCase.handle(request);
    expect(result).toEqual(left(new BalanceInsufficient()));
    expect(convertCurrency).toHaveBeenCalledTimes(0);
    expect(findByIdAccount).toHaveBeenCalledTimes(1);
    expect(findByIdAccount.mock.calls[0][0]).toStrictEqual(request.account_id);
  });

  it('should return an ERROR when transaction repository method create() fails', async () => {
    const errorMesssage = faker.lorem.words();
    const request = buildCreateTransactionDTO({
      amount: 200,
      transaction_type: TransactionType.DEPOSIT,
      currency: CurrencyTypes.REAL,
    });

    findByIdAccount.mockResolvedValueOnce(
      right(buildAccount({ id: request.account_id })),
    );
    create.mockReturnValueOnce(left(new Error(errorMesssage)));

    const result = await useCase.handle(request);
    expect(result).toEqual(left(new Error(errorMesssage)));
    expect(convertCurrency).toHaveBeenCalledTimes(0);
    expect(findByIdAccount).toHaveBeenCalledTimes(1);
    expect(findByIdAccount.mock.calls[0][0]).toStrictEqual(request.account_id);
    expect(create).toHaveBeenCalledTimes(1);
    expect(create.mock.calls[0][0]).toStrictEqual(
      buildTransaction({
        id: undefined,
        accountId: request.account_id,
        amount: 200,
        transactionType: TransactionType.DEPOSIT,
        status: StatusTransaction.PENDING,
        description: request.description,
        destinationAccountId: request.destination_account_id,
        updatedAt: undefined,
      }),
    );
  });

  it('should create a transaction succcesfuly', async () => {
    const request = buildCreateTransactionDTO({
      amount: 200,
      transaction_type: TransactionType.DEPOSIT,
      currency: CurrencyTypes.REAL,
    });

    const transactionToBeCreated = buildTransaction({
      id: undefined,
      accountId: request.account_id,
      amount: 200,
      transactionType: TransactionType.DEPOSIT,
      status: StatusTransaction.PENDING,
      description: request.description,
      destinationAccountId: request.destination_account_id,
      updatedAt: undefined,
    });

    const transactionCreated = buildTransaction({
      ...transactionToBeCreated,
      id: faker.string.uuid(),
    });

    findByIdAccount.mockResolvedValueOnce(
      right(buildAccount({ id: request.account_id })),
    );
    create.mockReturnValueOnce(right(transactionCreated));

    const result = await useCase.handle(request);
    expect(result).toEqual(right(transactionCreated));
    expect(convertCurrency).toHaveBeenCalledTimes(0);
    expect(findByIdAccount).toHaveBeenCalledTimes(1);
    expect(findByIdAccount.mock.calls[0][0]).toStrictEqual(request.account_id);
    expect(create).toHaveBeenCalledTimes(1);
    expect(create.mock.calls[0][0]).toStrictEqual(transactionToBeCreated);
    expect(emit).toHaveBeenCalledTimes(1);
    expect(emit).toHaveBeenCalledWith(
      'transaction.processed',
      expect.objectContaining({
        accountId: request.account_id,
        amount: request.amount,
        transactionType: request.transaction_type,
        destinationAccountId: request.destination_account_id,
      }),
    );
  });

  it('should create a transaction and a scheduled transaction succcesfuly', async () => {
    const scheduledAt = '2025-02-01';
    const request = buildCreateTransactionDTO({
      amount: 200,
      transaction_type: TransactionType.DEPOSIT,
      currency: CurrencyTypes.REAL,
      scheduled_at: scheduledAt,
    });

    const transactionToBeCreated = buildTransaction({
      id: undefined,
      accountId: request.account_id,
      amount: 200,
      transactionType: TransactionType.DEPOSIT,
      status: StatusTransaction.PENDING,
      description: request.description,
      destinationAccountId: request.destination_account_id,
      updatedAt: undefined,
    });

    const transactionCreated = buildTransaction({
      ...transactionToBeCreated,
      id: faker.string.uuid(),
    });

    findByIdAccount.mockResolvedValueOnce(
      right(buildAccount({ id: request.account_id })),
    );
    create.mockReturnValueOnce(right(transactionCreated));
    createScheduledTransaction.mockReturnValueOnce(right(undefined));

    const result = await useCase.handle(request);
    expect(result).toEqual(right(transactionCreated));
    expect(convertCurrency).toHaveBeenCalledTimes(0);
    expect(findByIdAccount).toHaveBeenCalledTimes(1);
    expect(findByIdAccount.mock.calls[0][0]).toStrictEqual(request.account_id);
    expect(create).toHaveBeenCalledTimes(1);
    expect(create.mock.calls[0][0]).toStrictEqual(transactionToBeCreated);
    expect(createScheduledTransaction).toHaveBeenCalledTimes(1);
    expect(createScheduledTransaction.mock.calls[0][0]).toStrictEqual(
      transactionCreated.id,
    );
    expect(createScheduledTransaction.mock.calls[0][1]).toStrictEqual(
      new Date(scheduledAt),
    );
    expect(emit).toHaveBeenCalledTimes(0);
  });
});
