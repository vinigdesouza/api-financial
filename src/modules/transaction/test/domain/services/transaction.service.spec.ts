import { Test, TestingModule } from '@nestjs/testing';
import { CustomLogger } from '../../../../shared/custom.logger';
import { left, right } from '../../../../shared/either';
import { faker } from '@faker-js/faker/.';
import {
  buildScheduledTransaction,
  buildTransaction,
  fakeLogger,
} from '../../../../shared/test/common.faker';
import { TransactionService } from '../../../domain/services/transaction.service';
import {
  createScheduledTransaction,
  fakeTransactionRepository,
  findByDateRange,
  findById,
  findScheduledTransactionByTransactionId,
  updateScheduledTransactionStatus,
} from '../../../../shared/test/mocks/transaction.repository.mock';
import { TransactionScheduler } from '../../../application/scheduled/transaction.scheduler';
import {
  fakeTransactionScheduler,
  scheduleTransaction,
} from '../../../../shared/test/mocks/transaction.scheduler.mock';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  emit,
  fakeEventEmitter2,
} from '../../../../shared/test/mocks/eventEmitter.mock';
import { StatusScheduledTransaction } from '../../../../transaction/domain/entity/scheduledTransaction.entity';

describe('TransactionService', () => {
  let service: TransactionService;

  beforeEach(async () => {
    jest.useFakeTimers().setSystemTime(new Date('2025-02-01'));

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionService,
        {
          provide: 'TransactionRepositoryInterface',
          useValue: fakeTransactionRepository,
        },
        {
          provide: TransactionScheduler,
          useValue: fakeTransactionScheduler,
        },
        {
          provide: EventEmitter2,
          useValue: fakeEventEmitter2,
        },
        {
          provide: CustomLogger,
          useValue: fakeLogger,
        },
      ],
    }).compile();

    service = module.get<TransactionService>(TransactionService);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('method createScheduledTransaction', () => {
    it('should return an error when repository createScheduledTransaction return error ', async () => {
      const errorMesssage = faker.lorem.words();
      const transactionId = faker.string.uuid();
      const scheduledTransaction = buildScheduledTransaction({
        transactionId,
        status: StatusScheduledTransaction.PENDING,
      });

      createScheduledTransaction.mockResolvedValueOnce(
        left(new Error(errorMesssage)),
      );

      const result = await service.createScheduledTransaction(
        transactionId,
        scheduledTransaction.scheduledAt,
      );
      expect(result).toEqual(left(new Error(errorMesssage)));
      expect(createScheduledTransaction).toHaveBeenCalledTimes(1);
      expect(createScheduledTransaction.mock.calls[0][0]).toStrictEqual(
        scheduledTransaction,
      );
    });

    it('should return undefined  when schedule transaction', async () => {
      const transactionId = faker.string.uuid();
      const scheduledTransaction = buildScheduledTransaction({
        transactionId,
        status: StatusScheduledTransaction.PENDING,
      });

      createScheduledTransaction.mockResolvedValueOnce(
        right(
          buildScheduledTransaction({
            ...scheduledTransaction,
            id: faker.string.uuid(),
          }),
        ),
      );
      scheduleTransaction.mockResolvedValueOnce(right(undefined));

      const result = await service.createScheduledTransaction(
        transactionId,
        scheduledTransaction.scheduledAt,
      );
      expect(result).toEqual(right(undefined));
      expect(createScheduledTransaction).toHaveBeenCalledTimes(1);
      expect(createScheduledTransaction.mock.calls[0][0]).toStrictEqual(
        scheduledTransaction,
      );
      expect(scheduleTransaction).toHaveBeenCalledTimes(1);
      expect(scheduleTransaction.mock.calls[0][0]).toStrictEqual(transactionId);
      expect(scheduleTransaction.mock.calls[0][1]).toStrictEqual(
        scheduledTransaction.scheduledAt,
      );
    });
  });

  describe('method processScheduleTransaction', () => {
    it('should return undefined when repository findById return error ', async () => {
      const errorMesssage = faker.lorem.words();
      const transactionId = faker.string.uuid();

      findById.mockResolvedValueOnce(left(new Error(errorMesssage)));

      const result = await service.processScheduleTransaction(transactionId);
      expect(result).toEqual(undefined);
      expect(findById).toHaveBeenCalledTimes(1);
      expect(findById.mock.calls[0][0]).toStrictEqual(transactionId);
    });

    it('should return undefined when repository findById return null ', async () => {
      const transactionId = faker.string.uuid();

      findById.mockResolvedValueOnce(right(null));

      const result = await service.processScheduleTransaction(transactionId);
      expect(result).toEqual(undefined);
      expect(findById).toHaveBeenCalledTimes(1);
      expect(findById.mock.calls[0][0]).toStrictEqual(transactionId);
    });

    it('should return undefined when repository findScheduledTransactionByTransactionId return error ', async () => {
      const errorMesssage = faker.lorem.words();
      const transactionId = faker.string.uuid();
      const transaction = buildTransaction({ id: transactionId });

      findById.mockResolvedValueOnce(right(transaction));
      findScheduledTransactionByTransactionId.mockResolvedValueOnce(
        left(new Error(errorMesssage)),
      );

      const result = await service.processScheduleTransaction(transactionId);
      expect(result).toEqual(undefined);
      expect(findById).toHaveBeenCalledTimes(1);
      expect(findById.mock.calls[0][0]).toStrictEqual(transactionId);
      expect(findScheduledTransactionByTransactionId).toHaveBeenCalledTimes(1);
      expect(
        findScheduledTransactionByTransactionId.mock.calls[0][0],
      ).toStrictEqual(transactionId);
    });

    it('should return undefined when repository findScheduledTransactionByTransactionId return null ', async () => {
      const transactionId = faker.string.uuid();
      const transaction = buildTransaction({ id: transactionId });

      findById.mockResolvedValueOnce(right(transaction));
      findScheduledTransactionByTransactionId.mockResolvedValueOnce(
        right(null),
      );

      const result = await service.processScheduleTransaction(transactionId);
      expect(result).toEqual(undefined);
      expect(findById).toHaveBeenCalledTimes(1);
      expect(findById.mock.calls[0][0]).toStrictEqual(transactionId);
      expect(findScheduledTransactionByTransactionId).toHaveBeenCalledTimes(1);
      expect(
        findScheduledTransactionByTransactionId.mock.calls[0][0],
      ).toStrictEqual(transactionId);
    });

    it('Should return undefined when scheduled transaction status is not PENDING', async () => {
      const transactionId = faker.string.uuid();
      const transaction = buildTransaction({ id: transactionId });
      const scheduleTransaction = buildScheduledTransaction({
        transactionId,
        status: StatusScheduledTransaction.PROCESSED,
      });

      findById.mockResolvedValueOnce(right(transaction));
      findScheduledTransactionByTransactionId.mockResolvedValueOnce(
        right(scheduleTransaction),
      );

      const result = await service.processScheduleTransaction(transactionId);
      expect(result).toEqual(undefined);
      expect(findById).toHaveBeenCalledTimes(1);
      expect(findById.mock.calls[0][0]).toStrictEqual(transactionId);
      expect(findScheduledTransactionByTransactionId).toHaveBeenCalledTimes(1);
      expect(
        findScheduledTransactionByTransactionId.mock.calls[0][0],
      ).toStrictEqual(transactionId);
    });

    it('Should return undefined when scheduled transaction scheduledAt is greater than now', async () => {
      const transactionId = faker.string.uuid();
      const transaction = buildTransaction({ id: transactionId });
      const scheduleTransaction = buildScheduledTransaction({
        transactionId,
        status: StatusScheduledTransaction.PENDING,
        scheduledAt: new Date('2025-02-12'),
      });

      findById.mockResolvedValueOnce(right(transaction));
      findScheduledTransactionByTransactionId.mockResolvedValueOnce(
        right(scheduleTransaction),
      );

      const result = await service.processScheduleTransaction(transactionId);
      expect(result).toEqual(undefined);
      expect(findById).toHaveBeenCalledTimes(1);
      expect(findById.mock.calls[0][0]).toStrictEqual(transactionId);
      expect(findScheduledTransactionByTransactionId).toHaveBeenCalledTimes(1);
      expect(
        findScheduledTransactionByTransactionId.mock.calls[0][0],
      ).toStrictEqual(transactionId);
    });

    it('Should return undefined when repository updateScheduledTransactionStatus() fails', async () => {
      const errorMesssage = faker.lorem.words();
      const transactionId = faker.string.uuid();
      const transaction = buildTransaction({ id: transactionId });
      const scheduleTransaction = buildScheduledTransaction({
        transactionId,
        status: StatusScheduledTransaction.PENDING,
        scheduledAt: new Date('2025-021-12'),
      });

      findById.mockResolvedValueOnce(right(transaction));
      findScheduledTransactionByTransactionId.mockResolvedValueOnce(
        right(scheduleTransaction),
      );
      updateScheduledTransactionStatus.mockResolvedValueOnce(
        left(new Error(errorMesssage)),
      );

      const result = await service.processScheduleTransaction(transactionId);
      expect(result).toEqual(undefined);
      expect(findById).toHaveBeenCalledTimes(1);
      expect(findById.mock.calls[0][0]).toStrictEqual(transactionId);
      expect(findScheduledTransactionByTransactionId).toHaveBeenCalledTimes(1);
      expect(
        findScheduledTransactionByTransactionId.mock.calls[0][0],
      ).toStrictEqual(transactionId);
      expect(updateScheduledTransactionStatus).toHaveBeenCalledTimes(1);
      expect(updateScheduledTransactionStatus.mock.calls[0][0]).toStrictEqual(
        transactionId,
      );
      expect(updateScheduledTransactionStatus.mock.calls[0][1]).toStrictEqual(
        StatusScheduledTransaction.PROCESSED,
      );
    });

    it('Should successfuly run processScheduleTransaction', async () => {
      const transactionId = faker.string.uuid();
      const transaction = buildTransaction({ id: transactionId });
      const scheduleTransaction = buildScheduledTransaction({
        transactionId,
        status: StatusScheduledTransaction.PENDING,
        scheduledAt: new Date('2025-021-12'),
      });

      findById.mockResolvedValueOnce(right(transaction));
      findScheduledTransactionByTransactionId.mockResolvedValueOnce(
        right(scheduleTransaction),
      );
      updateScheduledTransactionStatus.mockResolvedValueOnce(right(null));

      const result = await service.processScheduleTransaction(transactionId);
      expect(result).toEqual(undefined);
      expect(findById).toHaveBeenCalledTimes(1);
      expect(findById.mock.calls[0][0]).toStrictEqual(transactionId);
      expect(findScheduledTransactionByTransactionId).toHaveBeenCalledTimes(1);
      expect(
        findScheduledTransactionByTransactionId.mock.calls[0][0],
      ).toStrictEqual(transactionId);
      expect(updateScheduledTransactionStatus).toHaveBeenCalledTimes(1);
      expect(updateScheduledTransactionStatus.mock.calls[0][0]).toStrictEqual(
        transactionId,
      );
      expect(updateScheduledTransactionStatus.mock.calls[0][1]).toStrictEqual(
        StatusScheduledTransaction.PROCESSED,
      );
      expect(emit).toHaveBeenCalledTimes(1);
      expect(emit).toHaveBeenCalledWith(
        'transaction.processed',
        expect.objectContaining({
          accountId: transaction.accountId,
          amount: transaction.amount,
          transactionType: transaction.transactionType,
          destinationAccountId: transaction.destinationAccountId,
        }),
      );
    });
  });

  describe('method generateMonthlyReport', () => {
    it('should return an undefined when repository findByDateRange return error', async () => {
      const startDate = new Date();
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);
      endDate.setDate(0);
      endDate.setHours(23, 59, 59, 999);
      const errorMesssage = faker.lorem.words();
      findByDateRange.mockResolvedValueOnce(left(new Error(errorMesssage)));

      const result = await service.generateMonthlyReport();
      expect(result).toEqual(undefined);
      expect(findByDateRange).toHaveBeenCalledTimes(1);
      expect(findByDateRange.mock.calls[0][0]).toStrictEqual(startDate);
      expect(findByDateRange.mock.calls[0][1]).toStrictEqual(endDate);
    });

    it('should return an undefined when repository findByDateRange return no transaction', async () => {
      const startDate = new Date();
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);
      endDate.setDate(0);
      endDate.setHours(23, 59, 59, 999);
      findByDateRange.mockResolvedValueOnce(right([]));

      const result = await service.generateMonthlyReport();
      expect(result).toEqual(undefined);
      expect(findByDateRange).toHaveBeenCalledTimes(1);
      expect(findByDateRange.mock.calls[0][0]).toStrictEqual(startDate);
      expect(findByDateRange.mock.calls[0][1]).toStrictEqual(endDate);
    });

    it('should return an undefined when repository findByDateRange array of transactions', async () => {
      const startDate = new Date();
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);
      endDate.setDate(0);
      endDate.setHours(23, 59, 59, 999);

      const transactions = [buildTransaction({})];
      findByDateRange.mockResolvedValueOnce(right(transactions));

      const result = await service.generateMonthlyReport();
      expect(result).toEqual(undefined);
      expect(findByDateRange).toHaveBeenCalledTimes(1);
      expect(findByDateRange.mock.calls[0][0]).toStrictEqual(startDate);
      expect(findByDateRange.mock.calls[0][1]).toStrictEqual(endDate);
    });
  });
});
