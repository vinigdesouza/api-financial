import { faker } from '@faker-js/faker/.';
import {
  buildTransaction,
  buildTransactionModel,
} from '../../../../shared/test/common.faker';
import TransactionModel from '../../../infrastructure/models/transaction.model';

describe('Model TransactionModel', () => {
  it('Deve mapear uma Entidade com base em um modelo', () => {
    const model = buildTransactionModel({});

    const entity = TransactionModel.mapToEntity(model);

    expect(entity.id).toStrictEqual(model.id);
    expect(entity.accountId).toStrictEqual(model.account_id);
    expect(entity.amount).toStrictEqual(model.amount);
    expect(entity.status).toStrictEqual(model.status);
    expect(entity.transactionType).toStrictEqual(model.transaction_type);
    expect(entity.description).toStrictEqual(model.description);
    expect(entity.destinationAccountId).toStrictEqual(
      model.destination_account_id,
    );
    expect(entity.createdAt).toStrictEqual(model.created_at);
    expect(entity.updatedAt).toStrictEqual(model.updated_at);
  });

  it('Deve mapear um Modelo com base em uma Entidade', () => {
    const id = faker.string.uuid();
    const entity = buildTransaction({ id: id });

    const model = TransactionModel.mapToModel(entity, entity.id);

    expect(model.id).toStrictEqual(id);
    expect(model.account_id).toStrictEqual(entity.accountId);
    expect(model.amount).toStrictEqual(entity.amount);
    expect(model.status).toStrictEqual(entity.status);
    expect(model.created_at).toStrictEqual(entity.createdAt);
    expect(model.transaction_type).toStrictEqual(entity.transactionType);
    expect(model.description).toStrictEqual(entity.description);
    expect(model.destination_account_id).toStrictEqual(
      entity.destinationAccountId,
    );
    expect(model.updated_at).toStrictEqual(entity.updatedAt);
  });
});
