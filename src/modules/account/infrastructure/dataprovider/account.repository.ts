//

import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Either, left, right } from 'src/modules/shared/either';
import { Account } from '../../domain/entity/account.entity';
import { AccountRepositoryInterface } from '../../domain/repository/account.repository.interface';
import { Injectable } from '@nestjs/common';
import { CustomLogger } from 'src/modules/shared/custom.logger';
import AccountModel from '../models/account.model';

@Injectable()
export class AccountRepository implements AccountRepositoryInterface {
  constructor(
    @InjectRepository(AccountModel)
    private readonly accountRepository: Repository<AccountModel>,
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
        return right(AccountModel.mapToEntity(account));
      }

      this.logger.warn(`Account with ID ${id} not found`);
      return right(null);
    } catch (error) {
      console.log('error', error);
      this.logger.error(`Error when searching for account: ${error}`);
      return left(new Error('Error when searching for account'));
    }
  }
}
