import { faker } from '@faker-js/faker/.';
import { buildTransaction } from '../../../../shared/test/common.faker';
import { Transaction } from '../../../domain/entity/transaction.entity';

describe('Entity Transaction', () => {
  it('should create a valid Transaction', () => {
    const transaction = buildTransaction({});

    expect(transaction).toBeInstanceOf(Transaction);
    expect(transaction.accountId).toBe(transaction.accountId);
    expect(transaction.amount).toBe(transaction.amount);
    expect(transaction.id).toBe(transaction.id);
    expect(transaction.transactionType).toBe(transaction.transactionType);
    expect(transaction.description).toBe(transaction.description);
    expect(transaction.destinationAccountId).toBe(
      transaction.destinationAccountId,
    );
    expect(transaction.createdAt).toBeInstanceOf(Date);
  });

  it('should create a update valid transaction', () => {
    const idAccount = faker.string.uuid();
    const transaction = buildTransaction({ id: idAccount });

    const transactionCreated = Transaction.create(
      idAccount,
      transaction.amount,
      transaction.transactionType,
      transaction.status,
      transaction.description,
      transaction.destinationAccountId,
    );

    expect(transactionCreated).toBeInstanceOf(Transaction);
    expect(transactionCreated.accountId).toBe(idAccount);
    expect(transactionCreated.amount).toBe(transaction.amount);
    expect(transactionCreated.transactionType).toBe(
      transactionCreated.transactionType,
    );
    expect(transactionCreated.status).toBe(transaction.status);
    expect(transactionCreated.description).toBe(transaction.description);
    expect(transactionCreated.destinationAccountId).toBe(
      transaction.destinationAccountId,
    );
  });
});
