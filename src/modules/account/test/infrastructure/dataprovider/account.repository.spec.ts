/* eslint-disable @typescript-eslint/unbound-method */
import AccountModel from '../../../infrastructure/models/account.model';
import { CustomLogger } from '../../../../shared/custom.logger';
import {
  buildAccount,
  buildAccountModel,
  fakeLogger,
} from '../../util/common.faker';
import { DataSource, Repository } from 'typeorm';
import { mock } from 'jest-mock-extended';
import { AccountRepository } from '../../../infrastructure/dataprovider/account.repository';
import { Test, TestingModule } from '@nestjs/testing';
import { faker } from '@faker-js/faker/.';
import { left, right } from '../../../../shared/either';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('AccountRepository', () => {
  let repository: AccountRepository;
  let accountRepositoryMock: Repository<AccountModel>;
  let dataSourceMock: DataSource;

  beforeEach(async () => {
    accountRepositoryMock = {
      findOne: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnThis(),
      save: jest.fn(),
      delete: jest.fn(),
    } as unknown as Repository<AccountModel>;

    dataSourceMock = mock<DataSource>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountRepository,
        {
          provide: getRepositoryToken(AccountModel),
          useValue: accountRepositoryMock,
        },
        { provide: DataSource, useValue: dataSourceMock },
        { provide: CustomLogger, useValue: fakeLogger },
      ],
    }).compile();

    repository = module.get<AccountRepository>(AccountRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Método findById', () => {
    it('Should return ERROR when findOne fail', async () => {
      const errorMessage = faker.lorem.words();
      accountRepositoryMock.findOne = jest
        .fn()
        .mockRejectedValueOnce(new Error(errorMessage));

      const idAccount = faker.string.uuid();

      await expect(repository.findById(idAccount)).resolves.toStrictEqual(
        left(new Error('Error when searching for account')),
      );
      expect(accountRepositoryMock.findOne).toHaveBeenCalledTimes(1);
      expect(accountRepositoryMock.findOne).toHaveBeenCalledWith({
        where: { id: idAccount },
      });
    });

    it('Should return NULL when findOne return nothing', async () => {
      accountRepositoryMock.findOne = jest.fn().mockResolvedValueOnce(null);

      const idAccount = faker.string.uuid();

      await expect(repository.findById(idAccount)).resolves.toStrictEqual(
        right(null),
      );
      expect(accountRepositoryMock.findOne).toHaveBeenCalledTimes(1);
      expect(accountRepositoryMock.findOne).toHaveBeenCalledWith({
        where: { id: idAccount },
      });
    });

    it('Should return Account entity when findOne finding account', async () => {
      const idAccount = faker.string.uuid();
      const accountModel = buildAccountModel({ id: idAccount });
      accountRepositoryMock.findOne = jest
        .fn()
        .mockResolvedValueOnce(accountModel);

      await expect(repository.findById(idAccount)).resolves.toStrictEqual(
        right(AccountModel.mapToEntity(accountModel)),
      );
      expect(accountRepositoryMock.findOne).toHaveBeenCalledTimes(1);
      expect(accountRepositoryMock.findOne).toHaveBeenCalledWith({
        where: { id: idAccount },
      });
    });
  });

  describe('Método findByAccountNumber', () => {
    it('Should return ERROR when getOne fail', async () => {
      const errorMessage = faker.lorem.words();
      const whereMock = jest.fn().mockReturnThis();
      const getOneMock = jest
        .fn()
        .mockRejectedValueOnce(new Error(errorMessage));

      accountRepositoryMock.createQueryBuilder = jest.fn().mockReturnValueOnce({
        where: whereMock,
        getOne: getOneMock,
      });
      const numberAccount = faker.number.int({ min: 1, max: 3000 });

      await expect(
        repository.findByAccountNumber(numberAccount),
      ).resolves.toStrictEqual(
        left(new Error('Error when searching for account by number')),
      );
      expect(accountRepositoryMock.createQueryBuilder).toHaveBeenCalledTimes(1);
      expect(accountRepositoryMock.createQueryBuilder).toHaveBeenCalledWith(
        'account',
      );
      expect(whereMock).toHaveBeenCalledWith(
        'account.account_number = :accountNumber',
        { accountNumber: numberAccount },
      );
    });

    it('Should return NULL when getOne return nothing', async () => {
      const whereMock = jest.fn().mockReturnThis();
      const getOneMock = jest.fn().mockReturnValueOnce(null);

      accountRepositoryMock.createQueryBuilder = jest.fn().mockReturnValueOnce({
        where: whereMock,
        getOne: getOneMock,
      });
      const numberAccount = faker.number.int({ min: 1, max: 3000 });

      await expect(
        repository.findByAccountNumber(numberAccount),
      ).resolves.toStrictEqual(right(null));
      expect(accountRepositoryMock.createQueryBuilder).toHaveBeenCalledTimes(1);
      expect(accountRepositoryMock.createQueryBuilder).toHaveBeenCalledWith(
        'account',
      );
      expect(whereMock).toHaveBeenCalledWith(
        'account.account_number = :accountNumber',
        { accountNumber: numberAccount },
      );
    });

    it('Should return Account entity when getOne finding account', async () => {
      const numberAccount = faker.number.int({ min: 1, max: 3000 });
      const accountModel = buildAccountModel({ account_number: numberAccount });
      const whereMock = jest.fn().mockReturnThis();
      const getOneMock = jest.fn().mockResolvedValueOnce(accountModel);

      accountRepositoryMock.createQueryBuilder = jest.fn().mockReturnValueOnce({
        where: whereMock,
        getOne: getOneMock,
      });

      await expect(
        repository.findByAccountNumber(numberAccount),
      ).resolves.toStrictEqual(right(AccountModel.mapToEntity(accountModel)));
      expect(accountRepositoryMock.createQueryBuilder).toHaveBeenCalledTimes(1);
      expect(accountRepositoryMock.createQueryBuilder).toHaveBeenCalledWith(
        'account',
      );
      expect(whereMock).toHaveBeenCalledWith(
        'account.account_number = :accountNumber',
        { accountNumber: numberAccount },
      );
    });
  });

  describe('Método create', () => {
    it('Should return ERROR when save fail', async () => {
      const account = buildAccount({});
      const errorMessage = faker.lorem.words();
      accountRepositoryMock.save = jest
        .fn()
        .mockRejectedValueOnce(new Error(errorMessage));

      await expect(repository.create(account)).resolves.toStrictEqual(
        left(new Error('Error when creating account')),
      );
      expect(accountRepositoryMock.save).toHaveBeenCalledTimes(1);
      expect(accountRepositoryMock.save).toHaveBeenCalledWith(
        AccountModel.mapToModel(account),
      );
    });

    it('Should return ERROR when save return null', async () => {
      const account = buildAccount({});
      accountRepositoryMock.save = jest.fn().mockRejectedValueOnce(null);

      await expect(repository.create(account)).resolves.toStrictEqual(
        left(new Error('Error when creating account')),
      );
      expect(accountRepositoryMock.save).toHaveBeenCalledTimes(1);
      expect(accountRepositoryMock.save).toHaveBeenCalledWith(
        AccountModel.mapToModel(account),
      );
    });

    it('Should return Account when create succesfuly', async () => {
      const account = buildAccount({});
      const model = AccountModel.mapToModel(account);
      const accountCreated = buildAccountModel({
        ...model,
        id: faker.string.uuid(),
      });
      accountRepositoryMock.save = jest
        .fn()
        .mockResolvedValueOnce(accountCreated);

      await expect(repository.create(account)).resolves.toStrictEqual(
        right(AccountModel.mapToEntity(accountCreated)),
      );
      expect(accountRepositoryMock.save).toHaveBeenCalledTimes(1);
      expect(accountRepositoryMock.save).toHaveBeenCalledWith(model);
    });
  });

  describe('Método update', () => {
    it('Should return ERROR when save fail', async () => {
      const account = buildAccount({ id: undefined });
      const errorMessage = faker.lorem.words();
      accountRepositoryMock.save = jest
        .fn()
        .mockRejectedValueOnce(new Error(errorMessage));

      await expect(repository.update(account)).resolves.toStrictEqual(
        left(new Error('Error when updating account')),
      );
      expect(accountRepositoryMock.save).toHaveBeenCalledTimes(1);
      expect(accountRepositoryMock.save).toHaveBeenCalledWith(
        AccountModel.mapToModel(account),
      );
    });

    it('Should return ERROR when save return null', async () => {
      const account = buildAccount({ id: undefined });
      accountRepositoryMock.save = jest.fn().mockRejectedValueOnce(null);

      await expect(repository.update(account)).resolves.toStrictEqual(
        left(new Error('Error when updating account')),
      );
      expect(accountRepositoryMock.save).toHaveBeenCalledTimes(1);
      expect(accountRepositoryMock.save).toHaveBeenCalledWith(
        AccountModel.mapToModel(account),
      );
    });

    it('Should return Account when create succesfuly', async () => {
      const account = buildAccount({ id: undefined });
      const model = AccountModel.mapToModel(account);
      const accountCreated = buildAccountModel({});
      accountRepositoryMock.save = jest
        .fn()
        .mockResolvedValueOnce(accountCreated);

      await expect(repository.update(account)).resolves.toStrictEqual(
        right(AccountModel.mapToEntity(accountCreated)),
      );
      expect(accountRepositoryMock.save).toHaveBeenCalledTimes(1);
      expect(accountRepositoryMock.save).toHaveBeenCalledWith(model);
    });
  });

  describe('Método deleteAccount', () => {
    it('Should return ERROR when findOne fail', async () => {
      const errorMessage = faker.lorem.words();
      accountRepositoryMock.findOne = jest
        .fn()
        .mockRejectedValueOnce(new Error(errorMessage));

      const idAccount = faker.string.uuid();

      await expect(repository.deleteAccount(idAccount)).resolves.toStrictEqual(
        left(new Error('Error when deleting account')),
      );
      expect(accountRepositoryMock.findOne).toHaveBeenCalledTimes(1);
      expect(accountRepositoryMock.findOne).toHaveBeenCalledWith({
        where: { id: idAccount },
      });
    });

    it('Should return Error when findOne return null', async () => {
      accountRepositoryMock.findOne = jest.fn().mockResolvedValueOnce(null);

      const idAccount = faker.string.uuid();

      await expect(repository.deleteAccount(idAccount)).resolves.toStrictEqual(
        left(new Error('Account not found')),
      );
      expect(accountRepositoryMock.findOne).toHaveBeenCalledTimes(1);
      expect(accountRepositoryMock.findOne).toHaveBeenCalledWith({
        where: { id: idAccount },
      });
    });

    it('Should return Error when delete fail', async () => {
      const errorMessage = faker.lorem.words();
      const idAccount = faker.string.uuid();
      const account = buildAccount({ id: idAccount });
      accountRepositoryMock.findOne = jest.fn().mockResolvedValueOnce(account);
      accountRepositoryMock.delete = jest
        .fn()
        .mockRejectedValueOnce(new Error(errorMessage));

      await expect(repository.deleteAccount(idAccount)).resolves.toStrictEqual(
        left(new Error('Error when deleting account')),
      );
      expect(accountRepositoryMock.findOne).toHaveBeenCalledTimes(1);
      expect(accountRepositoryMock.findOne).toHaveBeenCalledWith({
        where: { id: idAccount },
      });
      expect(accountRepositoryMock.delete).toHaveBeenCalledTimes(1);
      expect(accountRepositoryMock.delete).toHaveBeenCalledWith(idAccount);
    });

    it('Should return NULL when delete account', async () => {
      const idAccount = faker.string.uuid();
      const account = buildAccount({ id: idAccount });
      accountRepositoryMock.findOne = jest.fn().mockResolvedValueOnce(account);
      accountRepositoryMock.delete = jest.fn().mockResolvedValueOnce(null);

      await expect(repository.deleteAccount(idAccount)).resolves.toStrictEqual(
        right(null),
      );
      expect(accountRepositoryMock.findOne).toHaveBeenCalledTimes(1);
      expect(accountRepositoryMock.findOne).toHaveBeenCalledWith({
        where: { id: idAccount },
      });
      expect(accountRepositoryMock.delete).toHaveBeenCalledTimes(1);
      expect(accountRepositoryMock.delete).toHaveBeenCalledWith(idAccount);
    });
  });
});
