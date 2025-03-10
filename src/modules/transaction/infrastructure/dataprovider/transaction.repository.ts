import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Either, left, right } from '../../../shared/either';
import { Injectable } from '@nestjs/common';
import { CustomLogger } from '../../../shared/custom.logger';
import { TransactionRepositoryInterface } from '../../domain/repository/transaction.repository.interface';
import TransactionModel from '../models/transaction.model';
import {
  StatusTransaction,
  Transaction,
} from '../../domain/entity/transaction.entity';
import {
  ScheduledTransaction,
  StatusScheduledTransaction,
} from '../../domain/entity/scheduledTransaction.entity';
import ScheduledTransactionModel from '../models/scheduledTransaction.model';

@Injectable()
export class TransactionRepository implements TransactionRepositoryInterface {
  constructor(
    @InjectRepository(TransactionModel)
    private readonly transactionRepository: Repository<TransactionModel>,
    @InjectRepository(ScheduledTransactionModel)
    private readonly scheduledTransactionRepository: Repository<ScheduledTransactionModel>,
    private readonly logger: CustomLogger,
  ) {}

  async findById(id: string): Promise<Either<Error, Transaction | null>> {
    this.logger.log(`Finding transaction with id: ${id}`);

    try {
      const transaction = await this.transactionRepository.findOne({
        where: { id },
      });

      if (transaction) {
        this.logger.log(`Transaction found: ${JSON.stringify(transaction)}`);
        return right(TransactionModel.mapToEntity(transaction));
      }

      this.logger.warn(`Transaction with ID ${id} not found`);
      return right(null);
    } catch (error) {
      this.logger.error(`Error when searching for transaction: ${error}`);
      return left(new Error('Error when searching for transaction'));
    }
  }

  async findByAccountId(
    accountId: string,
  ): Promise<Either<Error, Transaction[]>> {
    this.logger.log(`Finding transactions by account id: ${accountId}`);

    try {
      const transactions = await this.transactionRepository.find({
        where: { account_id: accountId },
      });

      this.logger.log(`Transactions found
      : ${JSON.stringify(transactions)}`);
      return right(
        transactions.map((transaction) =>
          TransactionModel.mapToEntity(transaction),
        ),
      );
    } catch (error) {
      this.logger.error(`Error when searching for transactions: ${error}`);
      return left(new Error('Error when searching for transactions'));
    }
  }

  async create(
    transaction: Omit<Transaction, 'id'>,
  ): Promise<Either<Error, Transaction>> {
    this.logger.log('Creating transaction');

    try {
      const transactionCreated = await this.transactionRepository.save(
        TransactionModel.mapToModel(transaction),
      );

      if (!transactionCreated) {
        this.logger.error('Error when creating transaction');
        return left(new Error('Error when creating transaction'));
      }

      this.logger.log(
        `Transaction created: ${JSON.stringify(transactionCreated)}`,
      );
      return right(TransactionModel.mapToEntity(transactionCreated));
    } catch (error) {
      this.logger.error(`Error when creating transaction: ${error}`);
      return left(new Error('Error when creating transaction'));
    }
  }

  async deleteTransaction(id: string): Promise<Either<Error, null>> {
    this.logger.log(`Deleting transaction with id: ${id}`);

    try {
      const transaction = await this.transactionRepository.findOne({
        where: { id },
      });

      if (!transaction) {
        this.logger.warn(`Transaction with ID ${id} not found`);
        return left(new Error('Transaction not found'));
      }

      await this.transactionRepository.delete(id);

      this.logger.log(`Transaction deleted: ${id}`);
      return right(null);
    } catch (error) {
      this.logger.error(`Error when deleting transaction: ${error}`);
      return left(new Error('Error when deleting transaction'));
    }
  }

  async updateTransactionStatus(
    id: string,
    status: StatusTransaction,
  ): Promise<Either<Error, null>> {
    this.logger.log(`Updating status transaction status with id: ${id}`);

    try {
      await this.transactionRepository.update(id, {
        status,
        updated_at: new Date(),
      });

      this.logger.log(`Transaction status updated: ${id}`);
      return right(null);
    } catch (error) {
      this.logger.error(`Error when updating transaction status: ${error}`);
      return left(new Error('Error when updating transaction status'));
    }
  }

  async createScheduledTransaction(
    scheduledTransaction: ScheduledTransaction,
  ): Promise<Either<Error, ScheduledTransaction>> {
    this.logger.log(
      `Creating scheduled transaction, ${JSON.stringify(scheduledTransaction)}`,
    );

    try {
      const scheduledTransactionCreated =
        await this.scheduledTransactionRepository.save(
          ScheduledTransactionModel.mapToModel(scheduledTransaction),
        );

      if (!scheduledTransactionCreated) {
        this.logger.error('Error when creating scheduled transaction');
        return left(new Error('Error when creating scheduled transaction'));
      }

      this.logger.log('Scheduled transaction created');
      return right(
        ScheduledTransactionModel.mapToEntity(scheduledTransactionCreated),
      );
    } catch (error) {
      this.logger.error(`Error when creating scheduled transaction: ${error}`);
      return left(new Error('Error when creating scheduled transaction'));
    }
  }

  async findScheduledTransactionByTransactionId(
    transactionId: string,
  ): Promise<Either<Error, ScheduledTransaction | null>> {
    this.logger.log('Finding scheduled transaction by transaction id');

    try {
      const scheduledTransaction =
        await this.scheduledTransactionRepository.findOne({
          where: { transaction_id: transactionId },
        });

      if (!scheduledTransaction) {
        this.logger.warn('Scheduled transaction not found');
        return right(null);
      }

      this.logger.log(
        `Scheduled transaction found: ${JSON.stringify(scheduledTransaction)}`,
      );
      return right(ScheduledTransactionModel.mapToEntity(scheduledTransaction));
    } catch (error) {
      this.logger.error(
        `Error when searching for scheduled transaction: ${error}`,
      );
      return left(new Error('Error when searching for scheduled transaction'));
    }
  }

  async updateScheduledTransactionStatus(
    transactionId: string,
    status: StatusScheduledTransaction,
  ): Promise<Either<Error, null>> {
    this.logger.log('Updating scheduled transaction status');

    try {
      await this.scheduledTransactionRepository.update(
        { transaction_id: transactionId },
        { updated_at: new Date(), status: status },
      );

      this.logger.log('Scheduled transaction status updated');
      return right(null);
    } catch (error) {
      this.logger.error(
        `Error when updating scheduled transaction status: ${error}`,
      );
      return left(
        new Error('Error when updating scheduled transaction status'),
      );
    }
  }
}
