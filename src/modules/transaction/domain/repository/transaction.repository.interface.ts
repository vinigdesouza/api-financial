import { Either } from 'src/modules/shared/either';
import { Transaction } from '../entity/transaction.entity';

export interface TransactionRepositoryInterface {
  findById(id: string): Promise<Either<Error, Transaction | null>>;
  findByAccountId(accountId: string): Promise<Either<Error, Transaction[]>>;
  create(transaction: Transaction): Promise<Either<Error, Transaction>>;
  delete(id: string): Promise<Either<Error, null>>;
}
