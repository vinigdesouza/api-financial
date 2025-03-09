import { Test, TestingModule } from '@nestjs/testing';
import { faker } from '@faker-js/faker/.';
import { AccountController } from '../../../infrastructure/controller/account.controller';
import { CreateAccountUsecase } from '../../../application/usecase/create.account.usecase';
import { UpdateAccountUsecase } from '../../../application/usecase/update.account.usecase';
import {
  deleteAccount,
  fakeAccountRepository,
  findById,
  getAccountStatement,
} from '../../../../shared/test/mocks/account.repository.mock';
import { CustomLogger } from '../../../../shared/custom.logger';
import {
  buildAccount,
  buildCreateAccountDTO,
  buildTransaction,
  buildUpsertAccountRequest,
  fakeLogger,
} from '../../../../shared/test/common.faker';
import { left, right } from '../../../../shared/either';
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InvalidAccountDataError } from '../../../application/exceptions/InvalidAccountDataError';

describe('AccountController', () => {
  const handleCreate: any = jest.fn();
  const handleUpdate: any = jest.fn();
  let controller: AccountController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccountController],
      providers: [
        {
          provide: CreateAccountUsecase,
          useValue: { handle: handleCreate },
        },
        {
          provide: UpdateAccountUsecase,
          useValue: { handle: handleUpdate },
        },
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

    controller = module.get<AccountController>(AccountController);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Route findOne', () => {
    it('should throw InternalServerErrorException when repository findById() method fails', async () => {
      const id = faker.string.uuid();
      const errorMessage = faker.lorem.words();
      findById.mockResolvedValueOnce(left(new Error(errorMessage)));

      await expect(controller.findOne(id)).rejects.toThrow(
        new InternalServerErrorException(errorMessage),
      );

      expect(findById).toHaveBeenCalledTimes(1);
      expect(findById.mock.calls[0][0]).toStrictEqual(id);
    });

    it('should throw NotFoundException when account not exists', async () => {
      const id = faker.string.uuid();
      findById.mockResolvedValueOnce(right(null));

      await expect(controller.findOne(id)).rejects.toThrow(
        new NotFoundException(),
      );
      expect(findById).toHaveBeenCalledTimes(1);
      expect(findById.mock.calls[0][0]).toStrictEqual(id);
    });

    it('should successfully return the account', async () => {
      const id = faker.string.uuid();
      const account = buildAccount({ id });
      findById.mockResolvedValueOnce(right(account));

      const result = await controller.findOne(id);
      expect(result).toEqual(account);
      expect(findById).toHaveBeenCalledTimes(1);
      expect(findById.mock.calls[0][0]).toStrictEqual(id);
    });
  });

  describe('Route create', () => {
    it('should throw BadRequestException when usecase fails with InvalidAccountDataError', async () => {
      const errorMessage = faker.lorem.words();
      const createAccountDto = buildCreateAccountDTO({});
      const usecaseRequest = buildUpsertAccountRequest({
        name: createAccountDto.name,
        accountNumber: createAccountDto.account_number,
        accountBalance: createAccountDto.account_balance,
        accountType: createAccountDto.account_type,
      });

      handleCreate.mockResolvedValueOnce(
        left(new InvalidAccountDataError(errorMessage)),
      );

      await expect(controller.create(createAccountDto)).rejects.toThrow(
        new BadRequestException(errorMessage),
      );
      expect(handleCreate).toHaveBeenCalledTimes(1);
      expect(handleCreate.mock.calls[0][0]).toMatchObject(usecaseRequest);
    });

    it('should throw InternalServerErrorException when usecase fails with ERROR', async () => {
      const errorMessage = faker.lorem.words();
      const createAccountDto = buildCreateAccountDTO({});
      const usecaseRequest = buildUpsertAccountRequest({
        name: createAccountDto.name,
        accountNumber: createAccountDto.account_number,
        accountBalance: createAccountDto.account_balance,
        accountType: createAccountDto.account_type,
      });

      handleCreate.mockResolvedValueOnce(left(new Error(errorMessage)));

      await expect(controller.create(createAccountDto)).rejects.toThrow(
        new InternalServerErrorException(errorMessage),
      );
      expect(handleCreate).toHaveBeenCalledTimes(1);
      expect(handleCreate.mock.calls[0][0]).toMatchObject(usecaseRequest);
    });

    it('should successfully return undefined', async () => {
      const createAccountDto = buildCreateAccountDTO({});
      const usecaseRequest = buildUpsertAccountRequest({
        name: createAccountDto.name,
        accountNumber: createAccountDto.account_number,
        accountBalance: createAccountDto.account_balance,
        accountType: createAccountDto.account_type,
      });

      handleCreate.mockResolvedValueOnce(
        right(
          buildAccount({
            id: faker.string.uuid(),
            name: createAccountDto.name,
            accountNumber: createAccountDto.account_number,
            accountBalance: createAccountDto.account_balance,
            accountType: createAccountDto.account_type,
            createdAt: new Date(),
            updatedAt: new Date(),
          }),
        ),
      );

      const result = await controller.create(createAccountDto);
      expect(result).toEqual(undefined);
      expect(handleCreate).toHaveBeenCalledTimes(1);
      expect(handleCreate.mock.calls[0][0]).toMatchObject(usecaseRequest);
    });
  });

  describe('Route update', () => {
    it('should throw BadRequestException when usecase fails with InvalidAccountDataError', async () => {
      const errorMessage = faker.lorem.words();
      const idAccount = faker.string.uuid();
      const createAccountDto = buildCreateAccountDTO({});
      const usecaseRequest = buildUpsertAccountRequest({
        name: createAccountDto.name,
        accountNumber: createAccountDto.account_number,
        accountBalance: createAccountDto.account_balance,
        accountType: createAccountDto.account_type,
      });

      handleUpdate.mockResolvedValueOnce(
        left(new InvalidAccountDataError(errorMessage)),
      );

      await expect(
        controller.update(idAccount, createAccountDto),
      ).rejects.toThrow(new BadRequestException(errorMessage));
      expect(handleUpdate).toHaveBeenCalledTimes(1);
      expect(handleUpdate.mock.calls[0][0]).toStrictEqual(idAccount);
      expect(handleUpdate.mock.calls[0][1]).toMatchObject(usecaseRequest);
    });

    it('should throw InternalServerErrorException when usecase fails with ERROR', async () => {
      const errorMessage = faker.lorem.words();
      const idAccount = faker.string.uuid();
      const createAccountDto = buildCreateAccountDTO({});
      const usecaseRequest = buildUpsertAccountRequest({
        name: createAccountDto.name,
        accountNumber: createAccountDto.account_number,
        accountBalance: createAccountDto.account_balance,
        accountType: createAccountDto.account_type,
      });

      handleUpdate.mockResolvedValueOnce(left(new Error(errorMessage)));

      await expect(
        controller.update(idAccount, createAccountDto),
      ).rejects.toThrow(new InternalServerErrorException(errorMessage));
      expect(handleUpdate).toHaveBeenCalledTimes(1);
      expect(handleUpdate.mock.calls[0][0]).toStrictEqual(idAccount);
      expect(handleUpdate.mock.calls[0][1]).toMatchObject(usecaseRequest);
    });

    it('should successfully return undefined', async () => {
      const idAccount = faker.string.uuid();
      const createAccountDto = buildCreateAccountDTO({});
      const usecaseRequest = buildUpsertAccountRequest({
        name: createAccountDto.name,
        accountNumber: createAccountDto.account_number,
        accountBalance: createAccountDto.account_balance,
        accountType: createAccountDto.account_type,
      });

      const account = buildAccount({
        id: idAccount,
        name: createAccountDto.name,
        accountNumber: createAccountDto.account_number,
        accountBalance: createAccountDto.account_balance,
        accountType: createAccountDto.account_type,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      handleUpdate.mockResolvedValueOnce(right(account));

      const result = await controller.update(idAccount, createAccountDto);
      expect(result).toEqual(account);
      expect(handleUpdate).toHaveBeenCalledTimes(1);
      expect(handleUpdate.mock.calls[0][0]).toStrictEqual(idAccount);
      expect(handleUpdate.mock.calls[0][1]).toMatchObject(usecaseRequest);
    });
  });

  describe('Route Delete', () => {
    it('should throw InternalServerErrorException when repository deleteAccount() method fails', async () => {
      const id = faker.string.uuid();
      const errorMessage = faker.lorem.words();
      deleteAccount.mockResolvedValueOnce(left(new Error(errorMessage)));

      await expect(controller.delete(id)).rejects.toThrow(
        new InternalServerErrorException(errorMessage),
      );
      expect(deleteAccount).toHaveBeenCalledTimes(1);
      expect(deleteAccount.mock.calls[0][0]).toStrictEqual(id);
    });

    it('should successfully return undefined', async () => {
      const id = faker.string.uuid();
      deleteAccount.mockResolvedValueOnce(right(null));

      const result = await controller.delete(id);
      expect(result).toEqual(undefined);
      expect(deleteAccount).toHaveBeenCalledTimes(1);
      expect(deleteAccount.mock.calls[0][0]).toStrictEqual(id);
    });
  });

  describe('Route generateAccountStatement', () => {
    it('should throw InternalServerErrorException when repository getAccountStatement() method fails', async () => {
      const id = faker.number.int({ min: 1, max: 3000 }).toString();
      const start_date = '2021-10-01';
      const end_date = '2021-10-10';
      const errorMessage = faker.lorem.words();
      getAccountStatement.mockResolvedValueOnce(left(new Error(errorMessage)));

      await expect(
        controller.generateAccountStatement(id, start_date, end_date),
      ).rejects.toThrow(new InternalServerErrorException(errorMessage));

      expect(getAccountStatement).toHaveBeenCalledTimes(1);
      expect(getAccountStatement.mock.calls[0][0]).toStrictEqual({
        accountId: undefined,
        accountNumber: parseInt(id),
        startDate: new Date(start_date),
        endDate: new Date(end_date),
        limit: 10,
        offset: 0,
        sortBy: 'created_at',
        sortOrder: 'DESC',
        transactionType: undefined,
      });
    });

    it('should successfully return the account statement', async () => {
      const id = faker.number.int({ min: 1, max: 3000 }).toString();
      const start_date = '2021-10-01';
      const end_date = '2021-10-10';
      const account = buildAccount({ accountNumber: parseInt(id) });
      const transactions = [
        buildTransaction({ accountId: account.id }),
        buildTransaction({ accountId: account.id }),
      ];
      account.adicionarTransaction(transactions[0]);
      account.adicionarTransaction(transactions[1]);
      const returnMock = account;
      getAccountStatement.mockResolvedValueOnce(right(returnMock));

      const result = await controller.generateAccountStatement(
        id,
        start_date,
        end_date,
      );
      expect(result).toEqual(account);
      expect(getAccountStatement).toHaveBeenCalledTimes(1);
      expect(getAccountStatement.mock.calls[0][0]).toStrictEqual({
        accountId: undefined,
        accountNumber: parseInt(id),
        startDate: new Date(start_date),
        endDate: new Date(end_date),
        limit: 10,
        offset: 0,
        sortBy: 'created_at',
        sortOrder: 'DESC',
        transactionType: undefined,
      });
    });

    // it('should successfully return the account', async () => {
    //   const id = faker.string.uuid();
    //   const account = buildAccount({ id });
    //   findById.mockResolvedValueOnce(right(account));

    //   const result = await controller.findOne(id);
    //   expect(result).toEqual(account);
    //   expect(findById).toHaveBeenCalledTimes(1);
    //   expect(findById.mock.calls[0][0]).toStrictEqual(id);
    // });
  });
});
