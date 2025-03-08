/* eslint-disable @typescript-eslint/unbound-method */

import { CustomLogger } from '../../../../shared/custom.logger';

import { DataSource, Repository } from 'typeorm';
import { mock } from 'jest-mock-extended';
import { Test, TestingModule } from '@nestjs/testing';
import { faker } from '@faker-js/faker/.';
import { left, right } from '../../../../shared/either';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TransactionRepository } from '../../../infrastructure/dataprovider/transaction.repository';
import TransactionModel from '../../../infrastructure/models/transaction.model';
import {
  buildTransaction,
  buildTransactionModel,
  fakeLogger,
} from '../../../../shared/test/common.faker';

describe('AccountRepository', () => {
  let repository: TransactionRepository;
  let transactionRepositoryMock: Repository<TransactionModel>;
  let dataSourceMock: DataSource;

  beforeEach(async () => {
    transactionRepositoryMock = {
      findOne: jest.fn(),
      find: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnThis(),
      save: jest.fn(),
      delete: jest.fn(),
    } as unknown as Repository<TransactionModel>;

    dataSourceMock = mock<DataSource>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionRepository,
        {
          provide: getRepositoryToken(TransactionModel),
          useValue: transactionRepositoryMock,
        },
        { provide: DataSource, useValue: dataSourceMock },
        { provide: CustomLogger, useValue: fakeLogger },
      ],
    }).compile();

    repository = module.get<TransactionRepository>(TransactionRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Método findById', () => {
    it('Should return ERROR when findOne fail', async () => {
      const errorMessage = faker.lorem.words();
      transactionRepositoryMock.findOne = jest
        .fn()
        .mockRejectedValueOnce(new Error(errorMessage));

      const idTransaction = faker.string.uuid();

      await expect(repository.findById(idTransaction)).resolves.toStrictEqual(
        left(new Error('Error when searching for transaction')),
      );
      expect(transactionRepositoryMock.findOne).toHaveBeenCalledTimes(1);
      expect(transactionRepositoryMock.findOne).toHaveBeenCalledWith({
        where: { id: idTransaction },
      });
    });

    it('Should return NULL when findOne return nothing', async () => {
      transactionRepositoryMock.findOne = jest.fn().mockResolvedValueOnce(null);

      const idTransaction = faker.string.uuid();

      await expect(repository.findById(idTransaction)).resolves.toStrictEqual(
        right(null),
      );
      expect(transactionRepositoryMock.findOne).toHaveBeenCalledTimes(1);
      expect(transactionRepositoryMock.findOne).toHaveBeenCalledWith({
        where: { id: idTransaction },
      });
    });

    it('Should return Transaction entity when findOne finding transaction', async () => {
      const idTransaction = faker.string.uuid();
      const transactionModel = buildTransactionModel({ id: idTransaction });
      transactionRepositoryMock.findOne = jest
        .fn()
        .mockResolvedValueOnce(transactionModel);

      await expect(repository.findById(idTransaction)).resolves.toStrictEqual(
        right(TransactionModel.mapToEntity(transactionModel)),
      );
      expect(transactionRepositoryMock.findOne).toHaveBeenCalledTimes(1);
      expect(transactionRepositoryMock.findOne).toHaveBeenCalledWith({
        where: { id: idTransaction },
      });
    });
  });

  describe('Método findByAccountId', () => {
    it('Should return ERROR when find fail', async () => {
      const errorMessage = faker.lorem.words();
      transactionRepositoryMock.find = jest
        .fn()
        .mockRejectedValueOnce(new Error(errorMessage));

      const accountId = faker.string.uuid();

      await expect(
        repository.findByAccountId(accountId),
      ).resolves.toStrictEqual(
        left(new Error('Error when searching for transactions')),
      );
      expect(transactionRepositoryMock.find).toHaveBeenCalledTimes(1);
      expect(transactionRepositoryMock.find).toHaveBeenCalledWith({
        where: { account_id: accountId },
      });
    });

    it('Should return [] when find return nothing', async () => {
      transactionRepositoryMock.find = jest.fn().mockResolvedValueOnce([]);

      const accountId = faker.string.uuid();

      await expect(
        repository.findByAccountId(accountId),
      ).resolves.toStrictEqual(right([]));
      expect(transactionRepositoryMock.find).toHaveBeenCalledTimes(1);
      expect(transactionRepositoryMock.find).toHaveBeenCalledWith({
        where: { account_id: accountId },
      });
    });

    it('Should return array of Transaction entity when find() finding transaction', async () => {
      const idAccount = faker.string.uuid();
      const transactionModel = buildTransactionModel({ id: idAccount });
      const transactionModel1 = buildTransactionModel({ id: idAccount });
      transactionRepositoryMock.find = jest
        .fn()
        .mockResolvedValueOnce([transactionModel, transactionModel1]);

      await expect(
        repository.findByAccountId(idAccount),
      ).resolves.toStrictEqual(
        right(
          [transactionModel, transactionModel1].map((transaction) =>
            TransactionModel.mapToEntity(transaction),
          ),
        ),
      );
      expect(transactionRepositoryMock.find).toHaveBeenCalledTimes(1);
      expect(transactionRepositoryMock.find).toHaveBeenCalledWith({
        where: { account_id: idAccount },
      });
    });
  });

  describe('Método create', () => {
    it('Should return ERROR when save fail', async () => {
      const transaction = buildTransaction({});
      const errorMessage = faker.lorem.words();
      transactionRepositoryMock.save = jest
        .fn()
        .mockRejectedValueOnce(new Error(errorMessage));

      await expect(repository.create(transaction)).resolves.toStrictEqual(
        left(new Error('Error when creating transaction')),
      );
      expect(transactionRepositoryMock.save).toHaveBeenCalledTimes(1);
      expect(transactionRepositoryMock.save).toHaveBeenCalledWith(
        TransactionModel.mapToModel(transaction),
      );
    });

    it('Should return ERROR when save return null', async () => {
      const transaction = buildTransaction({});
      transactionRepositoryMock.save = jest.fn().mockRejectedValueOnce(null);

      await expect(repository.create(transaction)).resolves.toStrictEqual(
        left(new Error('Error when creating transaction')),
      );
      expect(transactionRepositoryMock.save).toHaveBeenCalledTimes(1);
      expect(transactionRepositoryMock.save).toHaveBeenCalledWith(
        TransactionModel.mapToModel(transaction),
      );
    });

    it('Should return Transaction when create succesfuly', async () => {
      const transaction = buildTransaction({});
      const transactionModel = buildTransactionModel({});
      const transactionCreated = buildTransactionModel({
        ...transactionModel,
        id: faker.string.uuid(),
      });
      transactionRepositoryMock.save = jest
        .fn()
        .mockResolvedValueOnce(transactionCreated);

      await expect(repository.create(transaction)).resolves.toStrictEqual(
        right(TransactionModel.mapToEntity(transactionCreated)),
      );
      expect(transactionRepositoryMock.save).toHaveBeenCalledTimes(1);
      expect(transactionRepositoryMock.save).toHaveBeenCalledWith(
        TransactionModel.mapToModel(transaction),
      );
    });
  });

  describe('Método deleteAccount', () => {
    it('Should return ERROR when findOne fail', async () => {
      const errorMessage = faker.lorem.words();
      transactionRepositoryMock.findOne = jest
        .fn()
        .mockRejectedValueOnce(new Error(errorMessage));

      const idTransaction = faker.string.uuid();

      await expect(
        repository.deleteTransaction(idTransaction),
      ).resolves.toStrictEqual(
        left(new Error('Error when deleting transaction')),
      );
      expect(transactionRepositoryMock.findOne).toHaveBeenCalledTimes(1);
      expect(transactionRepositoryMock.findOne).toHaveBeenCalledWith({
        where: { id: idTransaction },
      });
    });

    it('Should return Error when findOne return null', async () => {
      transactionRepositoryMock.findOne = jest.fn().mockResolvedValueOnce(null);

      const idTransaction = faker.string.uuid();

      await expect(
        repository.deleteTransaction(idTransaction),
      ).resolves.toStrictEqual(left(new Error('Transaction not found')));
      expect(transactionRepositoryMock.findOne).toHaveBeenCalledTimes(1);
      expect(transactionRepositoryMock.findOne).toHaveBeenCalledWith({
        where: { id: idTransaction },
      });
    });

    it('Should return Error when delete fail', async () => {
      const errorMessage = faker.lorem.words();
      const idTransaction = faker.string.uuid();
      const transaction = buildTransaction({ id: idTransaction });
      transactionRepositoryMock.findOne = jest
        .fn()
        .mockResolvedValueOnce(transaction);
      transactionRepositoryMock.delete = jest
        .fn()
        .mockRejectedValueOnce(new Error(errorMessage));

      await expect(
        repository.deleteTransaction(idTransaction),
      ).resolves.toStrictEqual(
        left(new Error('Error when deleting transaction')),
      );
      expect(transactionRepositoryMock.findOne).toHaveBeenCalledTimes(1);
      expect(transactionRepositoryMock.findOne).toHaveBeenCalledWith({
        where: { id: idTransaction },
      });
      expect(transactionRepositoryMock.delete).toHaveBeenCalledTimes(1);
      expect(transactionRepositoryMock.delete).toHaveBeenCalledWith(
        idTransaction,
      );
    });

    it('Should return NULL when delete transaction', async () => {
      const idTransaction = faker.string.uuid();
      const transaction = buildTransaction({ id: idTransaction });
      transactionRepositoryMock.findOne = jest
        .fn()
        .mockResolvedValueOnce(transaction);
      transactionRepositoryMock.delete = jest.fn().mockResolvedValueOnce(null);

      await expect(
        repository.deleteTransaction(idTransaction),
      ).resolves.toStrictEqual(right(null));
      expect(transactionRepositoryMock.findOne).toHaveBeenCalledTimes(1);
      expect(transactionRepositoryMock.findOne).toHaveBeenCalledWith({
        where: { id: idTransaction },
      });
      expect(transactionRepositoryMock.delete).toHaveBeenCalledTimes(1);
      expect(transactionRepositoryMock.delete).toHaveBeenCalledWith(
        idTransaction,
      );
    });
  });
});
