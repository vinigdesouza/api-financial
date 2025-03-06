import { Test, TestingModule } from '@nestjs/testing';
import {
  create,
  fakeAccountRepository,
  findByAccountNumber,
} from '../util/mocks/account.repository.mock';
import {
  buildAccount,
  buildUpsertAccountRequest,
  fakeLogger,
} from '../util/common.faker';
import { CreateAccountUsecase } from '../../application/usecase/create.account.usecase';
import { CustomLogger } from '../../../shared/custom.logger';
import { left, right } from '../../../shared/either';
import { faker } from '@faker-js/faker/.';
import { InvalidAccountDataError } from '../../application/exceptions/InvalidAccountDataError';

describe('CreateAccountUsecase', () => {
  let useCase: CreateAccountUsecase;

  beforeEach(async () => {
    jest.useFakeTimers().setSystemTime(new Date('2025-02-01'));

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateAccountUsecase,
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

    useCase = module.get<CreateAccountUsecase>(CreateAccountUsecase);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return an error when the account cannot be retrieved by account number ', async () => {
    const errorMesssage = faker.lorem.words();
    const request = buildUpsertAccountRequest({});

    findByAccountNumber.mockResolvedValueOnce(left(new Error(errorMesssage)));

    const result = await useCase.handle(request);
    expect(result).toEqual(
      left(new Error('It was not possible to retrieve the account')),
    );
    expect(findByAccountNumber).toHaveBeenCalledTimes(1);
    expect(findByAccountNumber.mock.calls[0][0]).toStrictEqual(
      request.accountNumber,
    );
    expect(create).toHaveBeenCalledTimes(0);
  });

  it('should return InvalidAccountDataError when the account already exists ', async () => {
    const request = buildUpsertAccountRequest({});

    findByAccountNumber.mockResolvedValueOnce(right(buildAccount({})));

    const result = await useCase.handle(request);
    expect(result).toEqual(
      left(new InvalidAccountDataError('Account already exists')),
    );
    expect(findByAccountNumber).toHaveBeenCalledTimes(1);
    expect(findByAccountNumber.mock.calls[0][0]).toStrictEqual(
      request.accountNumber,
    );
    expect(create).toHaveBeenCalledTimes(0);
  });

  it('should return an error when the account cannot be created', async () => {
    const errorMesssage = faker.lorem.words();
    const request = buildUpsertAccountRequest({});
    const account = buildAccount({
      id: undefined,
      name: request.name,
      accountNumber: request.accountNumber,
      accountBalance: request.accountBalance,
      accountType: request.accountType,
      createdAt: new Date(),
      updatedAt: undefined,
    });

    findByAccountNumber.mockResolvedValueOnce(right(null));
    create.mockResolvedValueOnce(left(new Error(errorMesssage)));

    const result = await useCase.handle(request);
    expect(result).toEqual(left(new Error(errorMesssage)));
    expect(findByAccountNumber).toHaveBeenCalledTimes(1);
    expect(findByAccountNumber.mock.calls[0][0]).toStrictEqual(
      request.accountNumber,
    );
    expect(create).toHaveBeenCalledTimes(1);
    expect(create.mock.calls[0][0]).toStrictEqual(account);
  });

  it('should successfully create a new account', async () => {
    const request = buildUpsertAccountRequest({});
    const account = buildAccount({
      id: undefined,
      name: request.name,
      accountNumber: request.accountNumber,
      accountBalance: request.accountBalance,
      accountType: request.accountType,
      createdAt: new Date(),
      updatedAt: undefined,
    });

    const accountCreated = buildAccount({
      ...account,
      id: faker.string.uuid(),
    });

    findByAccountNumber.mockResolvedValueOnce(right(null));
    create.mockResolvedValueOnce(right(accountCreated));

    const result = await useCase.handle(request);
    expect(result).toEqual(right(accountCreated));
    expect(findByAccountNumber).toHaveBeenCalledTimes(1);
    expect(findByAccountNumber.mock.calls[0][0]).toStrictEqual(
      request.accountNumber,
    );
    expect(create).toHaveBeenCalledTimes(1);
    expect(create.mock.calls[0][0]).toStrictEqual(account);
  });
});
