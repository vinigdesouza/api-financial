import { Between, DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Either, left, right } from '../../../shared/either';
import { Account, StatementFilters } from '../../domain/entity/account.entity';
import { AccountRepositoryInterface } from '../../domain/repository/account.repository.interface';
import { Injectable } from '@nestjs/common';
import { CustomLogger } from '../../../shared/custom.logger';
import AccountModel from '../models/account.model';
import TransactionModel from '../../../transaction/infrastructure/models/transaction.model';

@Injectable()
export class AccountRepository implements AccountRepositoryInterface {
  constructor(
    @InjectRepository(AccountModel)
    private readonly accountRepository: Repository<AccountModel>,
    private readonly dataSource: DataSource,
    private readonly logger: CustomLogger,
  ) {}

  async findById(id: string): Promise<Either<Error, Account | null>> {
    this.logger.log(`Finding account with id: ${id}`);

    try {
      const account = await this.accountRepository.findOne({
        where: { id },
      });

      if (account) {
        this.logger.log(`Account found: ${JSON.stringify(account)}`);
        return right(AccountModel.mapToEntity(account, []));
      }

      this.logger.warn(`Account with ID ${id} not found`);
      return right(null);
    } catch (error) {
      this.logger.error(`Error when searching for account: ${error}`);
    }

    return left(new Error('Error when searching for account'));
  }

  async findByAccountNumber(
    accountNumber: number,
  ): Promise<Either<Error, Account | null>> {
    this.logger.log(`Finding account with account number: ${accountNumber}`);

    try {
      const account = await this.accountRepository
        .createQueryBuilder('account')
        .where('account.account_number = :accountNumber', { accountNumber })
        .getOne();

      if (account) {
        this.logger.log(`Account found: ${JSON.stringify(account)}`);
        return right(AccountModel.mapToEntity(account, []));
      }

      this.logger.warn(`Account with number ${accountNumber} not found`);
      return right(null);
    } catch (error) {
      this.logger.error(`Error when searching for account by number: ${error}`);
      return left(new Error('Error when searching for account by number'));
    }
  }

  async create(account: Omit<Account, 'id'>): Promise<Either<Error, Account>> {
    this.logger.log('Creating account');
    this.logger.log(`Account received: ${JSON.stringify(account)}`);

    try {
      const accountCreated = await this.accountRepository.save(
        AccountModel.mapToModel(account),
      );

      if (!accountCreated) {
        this.logger.error('Error when creating account');
        return left(new Error('Error when creating account'));
      }

      this.logger.log(`Account created: ${JSON.stringify(accountCreated)}`);
      return right(AccountModel.mapToEntity(accountCreated, []));
    } catch (error) {
      this.logger.error(`Error when creating account: ${error}`);
      return left(new Error('Error when creating account'));
    }
  }

  async update(account: Account): Promise<Either<Error, Account>> {
    this.logger.log('Updating account');
    this.logger.log(`Account received: ${JSON.stringify(account)}`);

    try {
      const accountUpdated = await this.accountRepository.save(
        AccountModel.mapToModel(account, account.id),
      );

      if (!accountUpdated) {
        this.logger.error('Error when updating account');
        return left(new Error('Error when updating account'));
      }
      this.logger.log(`Account updated: ${JSON.stringify(accountUpdated)}`);
      return right(AccountModel.mapToEntity(accountUpdated, []));
    } catch (error) {
      this.logger.error(`Error when updating account: ${error}`);
      return left(new Error('Error when updating account'));
    }
  }

  async deleteAccount(id: string): Promise<Either<Error, null>> {
    this.logger.log(`Deleting account with id: ${id}`);

    try {
      const account = await this.accountRepository.findOne({ where: { id } });

      if (!account) {
        this.logger.warn(`Account with ID ${id} not found`);
        return left(new Error('Account not found'));
      }

      await this.accountRepository.delete(id);
      this.logger.log(`Account with ID ${id} deleted`);
      return right(null);
    } catch (error) {
      this.logger.error(`Error when deleting account: ${error}`);
      return left(new Error('Error when deleting account'));
    }
  }

  async getAccountStatement(
    filters: StatementFilters,
  ): Promise<Either<Error, Account[]>> {
    this.logger.log(`Getting account statement: ${JSON.stringify(filters)}`);

    try {
      const query = this.accountRepository
        .createQueryBuilder('account')
        .where('account.account_number = :accountNumber', {
          accountNumber: filters.accountNumber,
        });

      if (filters.accountId) {
        query.andWhere('account.id = :accountId', {
          accountId: filters.accountId,
        });
      }

      const accounts = await query.getMany();

      if (accounts.length === 0) {
        this.logger.warn(
          `Account with number ${filters.accountNumber} not found`,
        );
        return right([]);
      }

      const accountsWithTransactions = await Promise.all(
        accounts.map(async (account) => {
          const transactions = await TransactionModel.find({
            where: {
              account: { id: account.id },
              created_at: Between(filters.startDate, filters.endDate),
              ...(filters.transactionType && {
                transaction_type: filters.transactionType,
              }),
            },
            order: {
              created_at:
                filters.sortOrder?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC',
            },
            take: filters.limit,
            skip: filters.offset,
          });

          return AccountModel.mapToEntity(account, transactions);
        }),
      );

      console.log('accounts returnes', accounts);
      this.logger.log(
        `Accounts with transactions found: ${JSON.stringify(accountsWithTransactions)}`,
      );

      return right(accountsWithTransactions);
    } catch (error) {
      this.logger.error(`Error when searching for account by filter: ${error}`);
      return left(new Error('Error when searching for account by filters'));
    }
  }
}
