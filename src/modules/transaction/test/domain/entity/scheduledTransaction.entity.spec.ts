import { buildScheduledTransaction } from '../../../../shared/test/common.faker';
import { ScheduledTransaction } from '../../../domain/entity/scheduledTransaction.entity';

describe('Entity ScheduledTransactionModel', () => {
  it('should create a valid ScheduledTransactionModel', () => {
    const scheduledTransaction = buildScheduledTransaction({});

    expect(scheduledTransaction).toBeInstanceOf(ScheduledTransaction);
    expect(scheduledTransaction.transactionId).toBe(
      scheduledTransaction.transactionId,
    );
    expect(scheduledTransaction.scheduledAt).toBe(
      scheduledTransaction.scheduledAt,
    );
    expect(scheduledTransaction.id).toBe(scheduledTransaction.id);
    expect(scheduledTransaction.status).toBe(scheduledTransaction.status);
    expect(scheduledTransaction.updatedAt).toBeInstanceOf(Date);
    expect(scheduledTransaction.createdAt).toBeInstanceOf(Date);
  });
});
