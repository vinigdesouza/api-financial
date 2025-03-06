import { Either } from 'src/modules/shared/either';
import { Account } from '../entity/account.entity';

export interface AccountRepositoryInterface {
  findById(id: string): Promise<Either<Error, Account | null>>;
  create(account: Account): Promise<Either<Error, Account>>;
  update(account: Account): Promise<Either<Error, Account>>;
  deleteAccount(id: string): Promise<Either<Error, null>>;
  findByAccountNumber(
    accountNumber: number,
  ): Promise<Either<Error, Account | null>>;
}
