import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Account, AccountType } from '../../domain/entity/account.entity';
import TransactionModel from '../../../transaction/infrastructure/models/transaction.model';

@Entity({ name: 'account' })
export default class AccountModel extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  account_number: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  account_balance: number;

  @Column()
  account_type: string;

  @Column({ type: 'timestamp' })
  created_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  updated_at?: Date;

  @OneToMany(() => TransactionModel, (transaction) => transaction.account)
  transactions: TransactionModel[];

  @OneToMany(
    () => TransactionModel,
    (transaction) => transaction.destination_account,
  )
  received_transactions: TransactionModel[];

  static mapToEntity(model: AccountModel): Account {
    const account = new Account(
      model.name,
      model.account_number,
      model.account_balance,
      model.account_type as AccountType,
      model.created_at,
      model.id,
      model.updated_at,
    );
    return account;
  }

  static mapToModel(entity: Omit<Account, 'id'>, id?: string): AccountModel {
    const model = new AccountModel();
    model.name = entity.name;
    model.account_number = entity.accountNumber;
    model.account_balance = entity.accountBalance;
    model.account_type = entity.accountType;
    model.created_at = entity.createdAt;
    model.updated_at = entity.updatedAt ?? undefined;
    if (id) {
      model.id = id;
    }
    return model;
  }
}
