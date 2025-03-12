/* eslint-disable @typescript-eslint/unbound-method */

import { CustomLogger } from '../../../../shared/custom.logger';

import { Between, Repository } from 'typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { faker } from '@faker-js/faker/.';
import { left, right } from '../../../../shared/either';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TransactionRepository } from '../../../infrastructure/dataprovider/transaction.repository';
import TransactionModel from '../../../infrastructure/models/transaction.model';
import {
  buildScheduledTransaction,
  buildScheduledTransactionModel,
  buildTransaction,
  buildTransactionModel,
  fakeLogger,
} from '../../../../shared/test/common.faker';
import ScheduledTransactionModel from '../../../infrastructure/models/scheduledTransaction.model';
import { StatusTransaction } from '../../../domain/entity/transaction.entity';
import { StatusScheduledTransaction } from '../../../domain/entity/scheduledTransaction.entity';

describe('AccountRepository', () => {
  let repository: TransactionRepository;
  let transactionRepositoryMock: Repository<TransactionModel>;
  let scheduledTransactionRepositoryMock: Repository<ScheduledTransactionModel>;

  beforeEach(async () => {
    transactionRepositoryMock = {
      findOne: jest.fn(),
      find: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnThis(),
      save: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
    } as unknown as Repository<TransactionModel>;

    scheduledTransactionRepositoryMock = {
      findOne: jest.fn(),
      update: jest.fn(),
      save: jest.fn(),
    } as unknown as Repository<ScheduledTransactionModel>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionRepository,
        {
          provide: getRepositoryToken(TransactionModel),
          useValue: transactionRepositoryMock,
        },
        {
          provide: getRepositoryToken(ScheduledTransactionModel),
          useValue: scheduledTransactionRepositoryMock,
        },
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

  describe('Método findByDateRange', () => {
    it('Should return ERROR when find fail', async () => {
      const errorMessage = faker.lorem.words();
      transactionRepositoryMock.find = jest
        .fn()
        .mockRejectedValueOnce(new Error(errorMessage));

      const endDate = faker.date.recent();
      const startDate = faker.date.past();

      await expect(
        repository.findByDateRange(startDate, endDate),
      ).resolves.toStrictEqual(
        left(new Error('Error when searching for transactions by date range')),
      );
      expect(transactionRepositoryMock.find).toHaveBeenCalledTimes(1);
      expect(transactionRepositoryMock.find).toHaveBeenCalledWith({
        where: { created_at: Between(startDate, endDate) },
      });
    });

    it('Should return [] when find return nothing', async () => {
      transactionRepositoryMock.find = jest.fn().mockResolvedValueOnce([]);

      const endDate = faker.date.recent();
      const startDate = faker.date.past();

      await expect(
        repository.findByDateRange(startDate, endDate),
      ).resolves.toStrictEqual(right([]));
      expect(transactionRepositoryMock.find).toHaveBeenCalledTimes(1);
      expect(transactionRepositoryMock.find).toHaveBeenCalledWith({
        where: { created_at: Between(startDate, endDate) },
      });
    });

    it('Should return array of Transaction entity when find() finding transaction', async () => {
      const endDate = faker.date.recent();
      const startDate = faker.date.past();
      const transactionModel = buildTransactionModel({});
      const transactionModel1 = buildTransactionModel({});
      transactionRepositoryMock.find = jest
        .fn()
        .mockResolvedValueOnce([transactionModel, transactionModel1]);

      await expect(
        repository.findByDateRange(startDate, endDate),
      ).resolves.toStrictEqual(
        right(
          [transactionModel, transactionModel1].map((transaction) =>
            TransactionModel.mapToEntity(transaction),
          ),
        ),
      );
      expect(transactionRepositoryMock.find).toHaveBeenCalledTimes(1);
      expect(transactionRepositoryMock.find).toHaveBeenCalledWith({
        where: { created_at: Between(startDate, endDate) },
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

  describe('Método deleteTransaction', () => {
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

  describe('Método updateTransactionStatus', () => {
    it('Should return ERROR when update() fail', async () => {
      const idTransaction = faker.string.uuid();
      const errorMessage = faker.lorem.words();
      transactionRepositoryMock.update = jest
        .fn()
        .mockRejectedValueOnce(new Error(errorMessage));

      await expect(
        repository.updateTransactionStatus(
          idTransaction,
          StatusTransaction.COMPLETED,
        ),
      ).resolves.toStrictEqual(
        left(new Error('Error when updating transaction status')),
      );
      expect(transactionRepositoryMock.update).toHaveBeenCalledTimes(1);
      expect(transactionRepositoryMock.update).toHaveBeenCalledWith(
        idTransaction,
        {
          status: StatusTransaction.COMPLETED,
          updated_at: expect.any(Date),
        },
      );
    });

    it('Should return null when update succesfuly', async () => {
      const transactionId = faker.string.uuid();
      const transactionUpdated = buildTransaction({
        id: faker.string.uuid(),
        status: StatusTransaction.COMPLETED,
      });
      transactionRepositoryMock.update = jest
        .fn()
        .mockResolvedValueOnce(transactionUpdated);

      await expect(
        repository.updateTransactionStatus(
          transactionId,
          StatusTransaction.COMPLETED,
        ),
      ).resolves.toStrictEqual(right(null));
      expect(transactionRepositoryMock.update).toHaveBeenCalledTimes(1);
      expect(transactionRepositoryMock.update).toHaveBeenCalledWith(
        transactionId,
        {
          status: StatusTransaction.COMPLETED,
          updated_at: expect.any(Date),
        },
      );
    });
  });

  describe('Método createScheduledTransaction', () => {
    it('Should return ERROR when save fail', async () => {
      const scheduledTransaction = buildScheduledTransaction({});
      const errorMessage = faker.lorem.words();
      scheduledTransactionRepositoryMock.save = jest
        .fn()
        .mockRejectedValueOnce(new Error(errorMessage));

      await expect(
        repository.createScheduledTransaction(scheduledTransaction),
      ).resolves.toStrictEqual(
        left(new Error('Error when creating scheduled transaction')),
      );
      expect(scheduledTransactionRepositoryMock.save).toHaveBeenCalledTimes(1);
      expect(scheduledTransactionRepositoryMock.save).toHaveBeenCalledWith(
        ScheduledTransactionModel.mapToModel(scheduledTransaction),
      );
    });

    it('Should return ERROR when save return null', async () => {
      const scheduledTransaction = buildScheduledTransaction({});
      scheduledTransactionRepositoryMock.save = jest
        .fn()
        .mockRejectedValueOnce(null);

      await expect(
        repository.createScheduledTransaction(scheduledTransaction),
      ).resolves.toStrictEqual(
        left(new Error('Error when creating scheduled transaction')),
      );
      expect(scheduledTransactionRepositoryMock.save).toHaveBeenCalledTimes(1);
      expect(scheduledTransactionRepositoryMock.save).toHaveBeenCalledWith(
        ScheduledTransactionModel.mapToModel(scheduledTransaction),
      );
    });

    it('Should return Transaction when create succesfuly', async () => {
      const scheduledTransaction = buildScheduledTransaction({});
      const scheduledTransactionModel = buildScheduledTransactionModel({});
      const scheduledTransactionCreated = buildScheduledTransactionModel({
        ...scheduledTransactionModel,
        id: faker.string.uuid(),
      });
      scheduledTransactionRepositoryMock.save = jest
        .fn()
        .mockResolvedValueOnce(scheduledTransactionCreated);

      await expect(
        repository.createScheduledTransaction(scheduledTransaction),
      ).resolves.toStrictEqual(
        right(
          ScheduledTransactionModel.mapToEntity(scheduledTransactionCreated),
        ),
      );
      expect(scheduledTransactionRepositoryMock.save).toHaveBeenCalledTimes(1);
      expect(scheduledTransactionRepositoryMock.save).toHaveBeenCalledWith(
        ScheduledTransactionModel.mapToModel(scheduledTransaction),
      );
    });
  });

  describe('Método findScheduledTransactionByTransactionId', () => {
    it('Should return ERROR when findOne fail', async () => {
      const errorMessage = faker.lorem.words();
      scheduledTransactionRepositoryMock.findOne = jest
        .fn()
        .mockRejectedValueOnce(new Error(errorMessage));

      const transactionId = faker.string.uuid();

      await expect(
        repository.findScheduledTransactionByTransactionId(transactionId),
      ).resolves.toStrictEqual(
        left(new Error('Error when searching for scheduled transaction')),
      );
      expect(scheduledTransactionRepositoryMock.findOne).toHaveBeenCalledTimes(
        1,
      );
      expect(scheduledTransactionRepositoryMock.findOne).toHaveBeenCalledWith({
        where: { transaction_id: transactionId },
      });
    });

    it('Should return null when find return nothing', async () => {
      scheduledTransactionRepositoryMock.findOne = jest
        .fn()
        .mockResolvedValueOnce(null);

      const transactionId = faker.string.uuid();

      await expect(
        repository.findScheduledTransactionByTransactionId(transactionId),
      ).resolves.toStrictEqual(right(null));
      expect(scheduledTransactionRepositoryMock.findOne).toHaveBeenCalledTimes(
        1,
      );
      expect(scheduledTransactionRepositoryMock.findOne).toHaveBeenCalledWith({
        where: { transaction_id: transactionId },
      });
    });

    it('Should return Scheduled Transaction entity when findOne() finding scheduled transaction', async () => {
      const idTransaction = faker.string.uuid();
      const transactionModel = buildScheduledTransactionModel({
        id: idTransaction,
      });

      scheduledTransactionRepositoryMock.findOne = jest
        .fn()
        .mockResolvedValueOnce(transactionModel);

      await expect(
        repository.findScheduledTransactionByTransactionId(idTransaction),
      ).resolves.toStrictEqual(
        right(ScheduledTransactionModel.mapToEntity(transactionModel)),
      );
      expect(scheduledTransactionRepositoryMock.findOne).toHaveBeenCalledTimes(
        1,
      );
      expect(scheduledTransactionRepositoryMock.findOne).toHaveBeenCalledWith({
        where: { transaction_id: idTransaction },
      });
    });
  });

  describe('Método updateScheduledTransactionStatus', () => {
    it('Should return ERROR when update() fail', async () => {
      const idTransaction = faker.string.uuid();
      const errorMessage = faker.lorem.words();
      scheduledTransactionRepositoryMock.update = jest
        .fn()
        .mockRejectedValueOnce(new Error(errorMessage));

      await expect(
        repository.updateScheduledTransactionStatus(
          idTransaction,
          StatusScheduledTransaction.PROCESSED,
        ),
      ).resolves.toStrictEqual(
        left(new Error('Error when updating scheduled transaction status')),
      );
      expect(scheduledTransactionRepositoryMock.update).toHaveBeenCalledTimes(
        1,
      );
      expect(scheduledTransactionRepositoryMock.update).toHaveBeenCalledWith(
        { transaction_id: idTransaction },
        {
          status: StatusScheduledTransaction.PROCESSED,
          updated_at: expect.any(Date),
        },
      );
    });

    it('Should return null when update succesfuly', async () => {
      const transactionId = faker.string.uuid();
      const updatedScheduledTransaction = buildScheduledTransaction({
        id: faker.string.uuid(),
        status: StatusScheduledTransaction.PROCESSED,
      });
      scheduledTransactionRepositoryMock.update = jest
        .fn()
        .mockResolvedValueOnce(updatedScheduledTransaction);

      await expect(
        repository.updateScheduledTransactionStatus(
          transactionId,
          StatusScheduledTransaction.PROCESSED,
        ),
      ).resolves.toStrictEqual(right(null));
      expect(scheduledTransactionRepositoryMock.update).toHaveBeenCalledTimes(
        1,
      );
      expect(scheduledTransactionRepositoryMock.update).toHaveBeenCalledWith(
        { transaction_id: transactionId },
        {
          status: StatusScheduledTransaction.PROCESSED,
          updated_at: expect.any(Date),
        },
      );
    });
  });
});
