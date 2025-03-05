import { Either } from 'src/modules/shared/either';
import { Account } from '../entity/account.entity';

export interface AccountRepositoryInterface {
  findById(id: string): Promise<Either<Error, Account | null>>;
  create(account: Account): Promise<Either<Error, Account>>;
  findByAccountNumber(
    accountNumber: number,
  ): Promise<Either<Error, Account | null>>;
}
