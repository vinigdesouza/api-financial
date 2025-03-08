import { Test, TestingModule } from '@nestjs/testing';
import { faker } from '@faker-js/faker/.';
import { CustomLogger } from '../../../../shared/custom.logger';
import { fakeLogger } from '../../../../account/test/util/common.faker';
import { left, right } from '../../../../shared/either';
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { TransactionController } from '../../../infrastructure/controller/transaction.controller';
import { CreateTransactionUsecase } from '../../../application/usecase/create.transaction.usecase';
import {
  deleteTransaction,
  fakeTransactionRepository,
  findByAccountId,
  findById,
} from '../../../../shared/test/mocks/transaction.repository.mock';
import {
  buildCreateTransactionDTO,
  buildTransaction,
} from '../../../../shared/test/common.faker';
import { AccountDoesNotExist } from '../../../../account/application/exceptions/AccountDoesNotExist';
import { BalanceInsufficient } from '../../../application/exceptions/BalanceInsufficient';

describe('AccountController', () => {
  const handleCreate: any = jest.fn();
  let controller: TransactionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionController],
      providers: [
        {
          provide: CreateTransactionUsecase,
          useValue: { handle: handleCreate },
        },
        {
          provide: 'TransactionRepositoryInterface',
          useValue: fakeTransactionRepository,
        },
        {
          provide: CustomLogger,
          useValue: fakeLogger,
        },
      ],
    }).compile();

    controller = module.get<TransactionController>(TransactionController);
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

    it('should throw NotFoundException when transaction not exists', async () => {
      const id = faker.string.uuid();
      findById.mockResolvedValueOnce(right(null));

      await expect(controller.findOne(id)).rejects.toThrow(
        new NotFoundException(),
      );
      expect(findById).toHaveBeenCalledTimes(1);
      expect(findById.mock.calls[0][0]).toStrictEqual(id);
    });

    it('should successfully return the transaction', async () => {
      const id = faker.string.uuid();
      const transaction = buildTransaction({ id });
      findById.mockResolvedValueOnce(right(transaction));

      const result = await controller.findOne(id);
      expect(result).toEqual(transaction);
      expect(findById).toHaveBeenCalledTimes(1);
      expect(findById.mock.calls[0][0]).toStrictEqual(id);
    });
  });

  describe('Route findByAccount', () => {
    it('should throw InternalServerErrorException when repository findByAccount() method fails', async () => {
      const idAccount = faker.string.uuid();
      const errorMessage = faker.lorem.words();
      findByAccountId.mockResolvedValueOnce(left(new Error(errorMessage)));

      await expect(controller.findByAccount(idAccount)).rejects.toThrow(
        new InternalServerErrorException(errorMessage),
      );

      expect(findByAccountId).toHaveBeenCalledTimes(1);
      expect(findByAccountId.mock.calls[0][0]).toStrictEqual(idAccount);
    });

    it('should throw NotFoundException when transaction not exists', async () => {
      const idAccount = faker.string.uuid();
      findByAccountId.mockResolvedValueOnce(right(null));

      await expect(controller.findByAccount(idAccount)).rejects.toThrow(
        new NotFoundException(),
      );
      expect(findByAccountId).toHaveBeenCalledTimes(1);
      expect(findByAccountId.mock.calls[0][0]).toStrictEqual(idAccount);
    });

    it('should successfully return the transaction', async () => {
      const idAccount = faker.string.uuid();
      const transaction = buildTransaction({ accountId: idAccount });
      const transaction1 = buildTransaction({ accountId: idAccount });
      findByAccountId.mockResolvedValueOnce(right([transaction, transaction1]));

      const result = await controller.findByAccount(idAccount);
      expect(result).toEqual([transaction, transaction1]);
      expect(findByAccountId).toHaveBeenCalledTimes(1);
      expect(findByAccountId.mock.calls[0][0]).toStrictEqual(idAccount);
    });
  });

  describe('Route create', () => {
    it('should throw InternalServerErrorException when usecase method fails', async () => {
      const errorMessage = faker.lorem.words();
      const request = buildCreateTransactionDTO({});

      handleCreate.mockResolvedValueOnce(left(new Error(errorMessage)));

      await expect(controller.create(request)).rejects.toThrow(
        new InternalServerErrorException(errorMessage),
      );

      expect(handleCreate).toHaveBeenCalledTimes(1);
      expect(handleCreate.mock.calls[0][0]).toStrictEqual(request);
    });

    it('should throw NotFoundException when usecase return AccountDoesNotExist', async () => {
      const request = buildCreateTransactionDTO({});

      handleCreate.mockResolvedValueOnce(left(new AccountDoesNotExist()));

      await expect(controller.create(request)).rejects.toThrow(
        new NotFoundException('Acount does not exist'),
      );
      expect(handleCreate).toHaveBeenCalledTimes(1);
      expect(handleCreate.mock.calls[0][0]).toStrictEqual(request);
    });

    it('should throw BadRequestException when usecase return BalanceInsufficient', async () => {
      const request = buildCreateTransactionDTO({});

      handleCreate.mockResolvedValueOnce(left(new BalanceInsufficient()));

      await expect(controller.create(request)).rejects.toThrow(
        new BadRequestException('Insufficient balance to make the transaction'),
      );
      expect(handleCreate).toHaveBeenCalledTimes(1);
      expect(handleCreate.mock.calls[0][0]).toStrictEqual(request);
    });

    it('should successfully create the transaction', async () => {
      const request = buildCreateTransactionDTO({});
      const transaction = buildTransaction({
        id: faker.string.uuid(),
        accountId: request.account_id,
        amount: request.amount,
        transactionType: request.transaction_type,
        createdAt: new Date(),
      });

      handleCreate.mockResolvedValueOnce(right(transaction));

      const result = await controller.create(request);
      expect(result).toEqual(transaction);
      expect(handleCreate).toHaveBeenCalledTimes(1);
      expect(handleCreate.mock.calls[0][0]).toStrictEqual(request);
    });
  });

  describe('Route delete', () => {
    it('should throw InternalServerErrorException when repository deleteTransaction() method fails', async () => {
      const id = faker.string.uuid();
      const errorMessage = faker.lorem.words();
      deleteTransaction.mockResolvedValueOnce(left(new Error(errorMessage)));

      await expect(controller.delete(id)).rejects.toThrow(
        new InternalServerErrorException(errorMessage),
      );

      expect(deleteTransaction).toHaveBeenCalledTimes(1);
      expect(deleteTransaction.mock.calls[0][0]).toStrictEqual(id);
    });

    it('should successfully delete the transaction', async () => {
      const id = faker.string.uuid();
      deleteTransaction.mockResolvedValueOnce(right(null));

      const result = await controller.delete(id);
      expect(result).toEqual(undefined);
      expect(deleteTransaction).toHaveBeenCalledTimes(1);
      expect(deleteTransaction.mock.calls[0][0]).toStrictEqual(id);
    });
  });
});
