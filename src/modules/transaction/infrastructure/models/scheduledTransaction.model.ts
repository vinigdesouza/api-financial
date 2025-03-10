import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import TransactionModel from './transaction.model';
import {
  ScheduledTransaction,
  StatusScheduledTransaction,
} from '../../domain/entity/scheduledTransaction.entity';

@Entity({ name: 'scheduled_transaction' })
export default class ScheduledTransactionModel extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  transaction_id: string;

  @Column({ type: 'timestamp' })
  scheduled_at: Date;

  @Column()
  status: string;

  @Column({ type: 'timestamp' })
  created_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  updated_at?: Date;

  @ManyToOne(
    () => TransactionModel,
    (transaction) => transaction.scheduledTransactions,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'transaction_id' })
  transaction: TransactionModel;

  static mapToEntity(model: ScheduledTransactionModel): ScheduledTransaction {
    const transaction = new ScheduledTransaction(
      model.transaction_id,
      model.scheduled_at,
      model.status as StatusScheduledTransaction,
      model.created_at,
      model.id,
    );
    return transaction;
  }

  static mapToModel(
    transaction: Omit<ScheduledTransaction, 'id'>,
    id?: string,
  ): ScheduledTransactionModel {
    const model = new ScheduledTransactionModel();
    model.transaction_id = transaction.transactionId;
    model.scheduled_at = transaction.scheduledAt;
    model.status = transaction.status;
    model.created_at = transaction.createdAt;
    model.updated_at = transaction.updatedAt;

    if (id) {
      model.id = id;
    }
    return model;
  }
}
