import { Test, TestingModule } from '@nestjs/testing';
import {
  create,
  fakeAccountRepository,
  findByAccountNumber,
  findById,
  update,
} from '../../util/mocks/account.repository.mock';
import {
  buildAccount,
  buildUpsertAccountRequest,
  fakeLogger,
} from '../../util/common.faker';
import { CustomLogger } from '../../../../shared/custom.logger';
import { left, right } from '../../../../shared/either';
import { faker } from '@faker-js/faker/.';
import { InvalidAccountDataError } from '../../../application/exceptions/InvalidAccountDataError';
import { UpdateAccountUsecase } from '../../../application/usecase/update.account.usecase';
import { AccountDoesNotExist } from '../../../application/exceptions/AccountDoesNotExist';

describe('UpdateAccountUsecase', () => {
  let useCase: UpdateAccountUsecase;

  beforeEach(async () => {
    jest.useFakeTimers().setSystemTime(new Date('2025-02-01'));

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateAccountUsecase,
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

    useCase = module.get<UpdateAccountUsecase>(UpdateAccountUsecase);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return an error when the account cannot be retrieved by account id ', async () => {
    const errorMesssage = faker.lorem.words();
    const request = buildUpsertAccountRequest({});
    const idAccount = faker.string.uuid();

    findById.mockResolvedValueOnce(left(new Error(errorMesssage)));

    const result = await useCase.handle(idAccount, request);
    expect(result).toEqual(left(new Error(errorMesssage)));
    expect(findById).toHaveBeenCalledTimes(1);
    expect(findById.mock.calls[0][0]).toStrictEqual(idAccount);
    expect(findByAccountNumber).toHaveBeenCalledTimes(0);
    expect(update).toHaveBeenCalledTimes(0);
  });

  it('should return an AccountDoesNotExist when the account does not exist ', async () => {
    const request = buildUpsertAccountRequest({});
    const idAccount = faker.string.uuid();

    findById.mockResolvedValueOnce(right(null));

    const result = await useCase.handle(idAccount, request);
    expect(result).toEqual(left(new AccountDoesNotExist()));
    expect(findById).toHaveBeenCalledTimes(1);
    expect(findById.mock.calls[0][0]).toStrictEqual(idAccount);
    expect(findByAccountNumber).toHaveBeenCalledTimes(0);
    expect(update).toHaveBeenCalledTimes(0);
  });

  it('should return an error when the account cannot be retrieved by account number ', async () => {
    const request = buildUpsertAccountRequest({});
    const idAccount = faker.string.uuid();
    const account = buildAccount({ id: idAccount });

    findById.mockResolvedValueOnce(right(account));
    findByAccountNumber.mockResolvedValueOnce(
      left(new Error(faker.lorem.words())),
    );

    const result = await useCase.handle(idAccount, request);
    expect(result).toEqual(
      left(Error('It was not possible to retrieve the account')),
    );
    expect(findById).toHaveBeenCalledTimes(1);
    expect(findById.mock.calls[0][0]).toStrictEqual(idAccount);
    expect(findByAccountNumber).toHaveBeenCalledTimes(1);
    expect(findByAccountNumber.mock.calls[0][0]).toStrictEqual(
      request.accountNumber,
    );
    expect(update).toHaveBeenCalledTimes(0);
  });

  it('should return an InvalidAccountDataError when the account already exists ', async () => {
    const request = buildUpsertAccountRequest({});
    const idAccount = faker.string.uuid();
    const account = buildAccount({ id: idAccount });

    findById.mockResolvedValueOnce(right(account));
    findByAccountNumber.mockResolvedValueOnce(
      right(buildAccount({ id: idAccount + 1 })),
    );

    const result = await useCase.handle(idAccount, request);
    expect(result).toEqual(
      left(new InvalidAccountDataError('Account already exists')),
    );
    expect(findById).toHaveBeenCalledTimes(1);
    expect(findById.mock.calls[0][0]).toStrictEqual(idAccount);
    expect(findByAccountNumber).toHaveBeenCalledTimes(1);
    expect(findByAccountNumber.mock.calls[0][0]).toStrictEqual(
      request.accountNumber,
    );
    expect(update).toHaveBeenCalledTimes(0);
  });

  it('should return an error when the account cannot be updated ', async () => {
    const errorMesssage = faker.lorem.words();
    const request = buildUpsertAccountRequest({});
    const idAccount = faker.string.uuid();
    const account = buildAccount({ id: idAccount });

    findById.mockResolvedValueOnce(right(account));
    findByAccountNumber.mockResolvedValueOnce(right(null));
    update.mockResolvedValueOnce(left(new Error(errorMesssage)));

    const result = await useCase.handle(idAccount, request);
    expect(result).toEqual(left(new Error(errorMesssage)));
    expect(findById).toHaveBeenCalledTimes(1);
    expect(findById.mock.calls[0][0]).toStrictEqual(idAccount);
    expect(findByAccountNumber).toHaveBeenCalledTimes(1);
    expect(findByAccountNumber.mock.calls[0][0]).toStrictEqual(
      request.accountNumber,
    );
    expect(update).toHaveBeenCalledTimes(1);
    expect(update.mock.calls[0][0]).toStrictEqual(
      buildAccount({
        ...account,
        name: request.name,
        accountNumber: request.accountNumber,
        accountBalance: request.accountBalance,
        accountType: request.accountType,
        updatedAt: new Date(),
      }),
    );
  });

  it('should successfully update a account ', async () => {
    const request = buildUpsertAccountRequest({});
    const idAccount = faker.string.uuid();
    const account = buildAccount({ id: idAccount });
    const accountUpdated = buildAccount({
      ...account,
      name: request.name,
      accountNumber: request.accountNumber,
      accountBalance: request.accountBalance,
      accountType: request.accountType,
      updatedAt: new Date(),
    });

    findById.mockResolvedValueOnce(right(account));
    findByAccountNumber.mockResolvedValueOnce(right(null));
    update.mockResolvedValueOnce(right(accountUpdated));

    const result = await useCase.handle(idAccount, request);
    expect(result).toEqual(right(accountUpdated));
    expect(findById).toHaveBeenCalledTimes(1);
    expect(findById.mock.calls[0][0]).toStrictEqual(idAccount);
    expect(findByAccountNumber).toHaveBeenCalledTimes(1);
    expect(findByAccountNumber.mock.calls[0][0]).toStrictEqual(
      request.accountNumber,
    );
    expect(update).toHaveBeenCalledTimes(1);
    expect(update.mock.calls[0][0]).toStrictEqual(buildAccount(accountUpdated));
  });
});
