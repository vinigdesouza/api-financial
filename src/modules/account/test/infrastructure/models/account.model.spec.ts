import AccountModel from '../../../infrastructure/models/account.model';
import { buildAccount, buildAccountModel } from '../../util/common.faker';
import { faker } from '@faker-js/faker/.';

describe('Model AccountModel', () => {
  it('Deve mapear uma Entidade com base em um modelo', () => {
    const model = buildAccountModel({});

    const entity = AccountModel.mapToEntity(model, []);

    expect(entity.id).toStrictEqual(model.id);
    expect(entity.accountBalance).toStrictEqual(model.account_balance);
    expect(entity.accountNumber).toStrictEqual(model.account_number);
    expect(entity.accountType).toStrictEqual(model.account_type);
    expect(entity.name).toStrictEqual(model.name);
    expect(entity.createdAt).toStrictEqual(model.created_at);
    expect(entity.updatedAt).toStrictEqual(model.updated_at);
  });

  it('Deve mapear um Modelo com base em uma Entidade', () => {
    const idAccount = faker.string.uuid();
    const entity = buildAccount({ id: idAccount });

    const model = AccountModel.mapToModel(entity, entity.id);

    expect(model.id).toStrictEqual(idAccount);
    expect(model.account_balance).toStrictEqual(entity.accountBalance);
    expect(model.account_number).toStrictEqual(entity.accountNumber);
    expect(model.account_type).toStrictEqual(entity.accountType);
    expect(model.created_at).toStrictEqual(entity.createdAt);
    expect(model.name).toStrictEqual(entity.name);
    expect(model.updated_at).toStrictEqual(entity.updatedAt);
  });
});
