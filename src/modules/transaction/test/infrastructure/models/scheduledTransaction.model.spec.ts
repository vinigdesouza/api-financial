import { faker } from '@faker-js/faker/.';
import {
  buildScheduledTransaction,
  buildScheduledTransactionModel,
} from '../../../../shared/test/common.faker';
import ScheduledTransactionModel from '../../../infrastructure/models/scheduledTransaction.model';

describe('Model ScheduledTransactionModel', () => {
  it('Deve mapear uma Entidade com base em um modelo', () => {
    const model = buildScheduledTransactionModel({});

    const entity = ScheduledTransactionModel.mapToEntity(model);

    expect(entity.id).toStrictEqual(model.id);
    expect(entity.transactionId).toStrictEqual(model.transaction_id);
    expect(entity.scheduledAt).toStrictEqual(model.scheduled_at);
    expect(entity.status).toStrictEqual(model.status);
    expect(entity.createdAt).toStrictEqual(model.created_at);
  });

  it('Deve mapear um Modelo com base em uma Entidade', () => {
    const id = faker.string.uuid();
    const entity = buildScheduledTransaction({ id: id });

    const model = ScheduledTransactionModel.mapToModel(entity, id);

    expect(model.id).toStrictEqual(id);
    expect(model.transaction_id).toStrictEqual(entity.transactionId);
    expect(model.scheduled_at).toStrictEqual(entity.scheduledAt);
    expect(model.status).toStrictEqual(entity.status);
    expect(model.created_at).toStrictEqual(entity.createdAt);
    expect(model.updated_at).toStrictEqual(entity.updatedAt);
  });
});
