import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import {
  StatusTransaction,
  Transaction,
  TransactionType,
} from '../../domain/entity/transaction.entity';
import AccountModel from '../../../account/infrastructure/models/account.model';
import ScheduledTransactionModel from './scheduledTransaction.model';

@Entity({ name: 'transaction' })
export default class TransactionModel extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  account_id: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column()
  transaction_type: string;

  @Column()
  status: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ nullable: true })
  destination_account_id?: string;

  @Column({ type: 'timestamp' })
  created_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  updated_at?: Date;

  @OneToMany(
    () => ScheduledTransactionModel,
    (scheduledTransaction) => scheduledTransaction.transaction, // Relacionamento de volta
  )
  scheduledTransactions: ScheduledTransactionModel[];

  @ManyToOne(() => AccountModel, (account) => account.transactions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'account_id' })
  account: AccountModel;

  @ManyToOne(() => AccountModel, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'destination_account_id' })
  destination_account?: AccountModel;

  static mapToEntity(model: TransactionModel): Transaction {
    const transaction = new Transaction(
      model.account_id,
      parseFloat(model.amount.toString()),
      model.transaction_type as TransactionType,
      model.status as StatusTransaction,
      model.created_at,
      model.description,
      model.destination_account_id,
      model.id,
      model.updated_at,
    );
    return transaction;
  }

  static mapToModel(
    transaction: Omit<Transaction, 'id'>,
    id?: string,
  ): TransactionModel {
    const model = new TransactionModel();
    model.account_id = transaction.accountId;
    model.amount = transaction.amount;
    model.transaction_type = transaction.transactionType;
    model.status = transaction.status;
    model.created_at = transaction.createdAt;
    model.description = transaction.description;
    model.destination_account_id = transaction.destinationAccountId;
    model.updated_at = transaction.updatedAt;
    if (id) {
      model.id = id;
    }
    return model;
  }
}
