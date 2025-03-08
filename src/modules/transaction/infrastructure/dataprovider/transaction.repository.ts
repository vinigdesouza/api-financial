import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Either, left, right } from '../../../shared/either';
import { Injectable } from '@nestjs/common';
import { CustomLogger } from '../../../shared/custom.logger';
import { TransactionRepositoryInterface } from '../../domain/repository/transaction.repository.interface';
import TransactionModel from '../models/transaction.model';
import { Transaction } from '../../domain/entity/transaction.entity';

@Injectable()
export class TransactionRepository implements TransactionRepositoryInterface {
  constructor(
    @InjectRepository(TransactionModel)
    private readonly transactionRepository: Repository<TransactionModel>,
    private readonly dataSource: DataSource,
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

  async create(transaction: Transaction): Promise<Either<Error, Transaction>> {
    this.logger.log('Creating transaction');

    try {
      const transactionModel = TransactionModel.mapToModel(transaction);
      await this.transactionRepository.save(transactionModel);

      this.logger.log(
        `Transaction created: ${JSON.stringify(transactionModel)}`,
      );
      return right(TransactionModel.mapToEntity(transactionModel));
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
}
