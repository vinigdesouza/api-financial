import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import {
  Account,
  AccountType,
} from '../src/modules/account/domain/entity/account.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountRepositoryInterface } from '../src/modules/account/domain/repository/account.repository.interface';
import { CreateAccountTable1741108788820 } from '../src/migration/1741128600352-CreateAccountTable';
import AccountModel from '../src/modules/account/infrastructure/models/account.model';
import {
  buildAccount,
  buildAccountModel,
  buildCreateAccountDTO,
} from '../src/modules/account/test/util/common.faker';
import { left, right } from '../src/modules/shared/either';
import { faker } from '@faker-js/faker/.';
import { CreateAccountUsecase } from '../src/modules/account/application/usecase/create.account.usecase';
import { InvalidAccountDataError } from '../src/modules/account/application/exceptions/InvalidAccountDataError';
import { UpdateAccountUsecase } from '../src/modules/account/application/usecase/update.account.usecase';
import { AccountDoesNotExist } from '../src/modules/account/application/exceptions/AccountDoesNotExist';

describe('AccountController (e2e)', () => {
  let app: INestApplication;
  let accountRepository: AccountRepositoryInterface;
  let accountCreateUsecase: CreateAccountUsecase;
  let accountUpdateUsecase: UpdateAccountUsecase;
  const token = process.env.AUTH_TOKEN;
  const tokenInvalid = process.env.AUTH_TOKEN_INVALID;

  beforeAll(async () => {
    // jest.useFakeTimers().setSystemTime(new Date('2025-02-01'));

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    accountRepository = moduleFixture.get<AccountRepositoryInterface>(
      'AccountRepositoryInterface',
    );

    accountCreateUsecase =
      moduleFixture.get<CreateAccountUsecase>(CreateAccountUsecase);

    accountUpdateUsecase =
      moduleFixture.get<UpdateAccountUsecase>(UpdateAccountUsecase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /account/:id', () => {
    it('should return NotFoundException', async () => {
      const accountId = faker.string.uuid();

      jest
        .spyOn(accountRepository, 'findById')
        .mockResolvedValueOnce(right(null));

      const response = await request(app.getHttpServer())
        .get(`/account/${accountId}`)
        .set(`Authorization`, `Bearer ${token}`)
        .expect(404);

      console.log(response.body);

      expect(response.body.message).toEqual('Not Found');
    });

    it('should return account data', async () => {
      const accountId = faker.string.uuid();
      const createAccountModel = buildAccountModel({ id: accountId });

      await AccountModel.save(createAccountModel);

      const response = await request(app.getHttpServer())
        .get(`/account/${accountId}`)
        .set(`Authorization`, `Bearer ${token}`)
        .expect(200);

      expect(response.body).toEqual({
        id: accountId,
        name: createAccountModel.name,
        accountNumber: createAccountModel.account_number,
        accountBalance: createAccountModel.account_balance,
        accountType: createAccountModel.account_type,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    });
  });

  describe('POST /account', () => {
    it('should create a new account', async () => {
      const createAccountDto = {
        name: 'Test Account',
        account_number: faker.number.int({ min: 10000, max: 30000 }),
        account_balance: 1000,
        account_type: 'CONTA CORRENTE',
      };

      const response = await request(app.getHttpServer())
        .post('/account')
        .send(createAccountDto)
        .set(`Authorization`, `Bearer ${token}`)
        .expect(201);

      expect(response.body).toEqual({});
    });

    it('should return BadRequestException', async () => {
      const createAccountDto = {
        name: 'Test Account',
        account_number: faker.number.int({ min: 10000, max: 30000 }),
        account_balance: 1000,
        account_type: 'CONTA CORRENTE',
      };

      jest
        .spyOn(accountCreateUsecase, 'handle')
        .mockResolvedValueOnce(
          left(new InvalidAccountDataError('Account already exists')),
        );

      const response = await request(app.getHttpServer())
        .post('/account')
        .send(createAccountDto)
        .set(`Authorization`, `Bearer ${token}`)
        .expect(400);

      expect(response.body.message).toEqual('Account already exists');
      expect(response.body.error).toEqual('Bad Request');
    });

    it('should return InternalServerErrorException', async () => {
      const errorMesssage = faker.lorem.words();
      const createAccountDto = {
        name: 'Test Account',
        account_number: faker.number.int({ min: 10000, max: 30000 }),
        account_balance: 1000,
        account_type: 'CONTA CORRENTE',
      };

      jest
        .spyOn(accountCreateUsecase, 'handle')
        .mockResolvedValueOnce(left(new Error(errorMesssage)));

      const response = await request(app.getHttpServer())
        .post('/account')
        .send(createAccountDto)
        .set(`Authorization`, `Bearer ${token}`)
        .expect(500);

      expect(response.body.message).toEqual(errorMesssage);
      expect(response.body.error).toEqual('Internal Server Error');
    });
  });

  describe('PUT /account/:id', () => {
    it('should UPDATE an account', async () => {
      const idAccount = faker.string.uuid();
      const createAccountDto = buildCreateAccountDTO({
        name: 'Test Account',
        account_number: faker.number.int({ min: 10000, max: 30000 }),
        account_balance: 1000,
        account_type: AccountType.CONTA_CORRENTE,
      });

      const accountUpdated = buildAccount({
        id: idAccount,
        name: createAccountDto.name,
        accountNumber: createAccountDto.account_number,
        accountBalance: createAccountDto.account_balance,
        accountType: createAccountDto.account_type,
      });

      jest
        .spyOn(accountUpdateUsecase, 'handle')
        .mockResolvedValueOnce(right(accountUpdated));

      const response = await request(app.getHttpServer())
        .put(`/account/${idAccount}`)
        .send(createAccountDto)
        .set(`Authorization`, `Bearer ${token}`)
        .expect(200);

      expect(response.body).toEqual({
        ...accountUpdated,
        createdAt: accountUpdated.createdAt.toISOString(),
        updatedAt: accountUpdated.updatedAt?.toISOString(),
      });
    });

    it('should UPDATE return BadRequestException', async () => {
      const idAccount = faker.string.uuid();
      const createAccountDto = buildCreateAccountDTO({
        name: 'Test Account',
        account_number: faker.number.int({ min: 10000, max: 30000 }),
        account_balance: 1000,
        account_type: AccountType.CONTA_CORRENTE,
      });

      jest
        .spyOn(accountUpdateUsecase, 'handle')
        .mockResolvedValueOnce(
          left(new InvalidAccountDataError('Account already exists')),
        );

      const response = await request(app.getHttpServer())
        .put(`/account/${idAccount}`)
        .send(createAccountDto)
        .set(`Authorization`, `Bearer ${token}`)
        .expect(400);

      expect(response.body.message).toEqual('Account already exists');
      expect(response.body.error).toEqual('Bad Request');
    });

    it('should UPDATE return NotFoundException', async () => {
      const idAccount = faker.string.uuid();
      const createAccountDto = buildCreateAccountDTO({
        name: 'Test Account',
        account_number: faker.number.int({ min: 10000, max: 30000 }),
        account_balance: 1000,
        account_type: AccountType.CONTA_CORRENTE,
      });

      jest
        .spyOn(accountUpdateUsecase, 'handle')
        .mockResolvedValueOnce(left(new AccountDoesNotExist()));

      const response = await request(app.getHttpServer())
        .put(`/account/${idAccount}`)
        .send(createAccountDto)
        .set(`Authorization`, `Bearer ${token}`)
        .expect(404);

      expect(response.body.message).toEqual('Acount does not exist');
      expect(response.body.error).toEqual('Not Found');
    });

    it('should UPDATE return InternalServerErrorException', async () => {
      const errorMesssage = faker.lorem.words();
      const idAccount = faker.string.uuid();
      const createAccountDto = buildCreateAccountDTO({
        name: 'Test Account',
        account_number: faker.number.int({ min: 10000, max: 30000 }),
        account_balance: 1000,
        account_type: AccountType.CONTA_CORRENTE,
      });

      jest
        .spyOn(accountUpdateUsecase, 'handle')
        .mockResolvedValueOnce(left(new Error(errorMesssage)));

      const response = await request(app.getHttpServer())
        .put(`/account/${idAccount}`)
        .send(createAccountDto)
        .set(`Authorization`, `Bearer ${token}`)
        .expect(500);

      expect(response.body.message).toEqual(errorMesssage);
      expect(response.body.error).toEqual('Internal Server Error');
    });
  });

  describe('DELETE /account/:id', () => {
    it('should return InternalServerErrorException', async () => {
      const errorMesssage = faker.lorem.words();
      const accountId = faker.string.uuid();

      jest
        .spyOn(accountRepository, 'deleteAccount')
        .mockResolvedValueOnce(left(new Error(errorMesssage)));

      const response = await request(app.getHttpServer())
        .delete(`/account/${accountId}`)
        .set(`Authorization`, `Bearer ${token}`)
        .expect(500);

      expect(response.body.message).toEqual('Account not found');
      expect(response.body.error).toEqual('Internal Server Error');
    });

    it('should delete return Unauthorized when token is missing', async () => {
      const accountId = faker.string.uuid();
      const createAccountModel = buildAccountModel({ id: accountId });

      await AccountModel.save(createAccountModel);

      jest
        .spyOn(accountRepository, 'deleteAccount')
        .mockResolvedValueOnce(right(null));

      const response = await request(app.getHttpServer())
        .delete(`/account/${accountId}`)
        .expect(401);

      expect(response.body.error).toEqual('Unauthorized');
      expect(response.body.message).toEqual('Token is missing');
    });

    it('should delete return Unauthorized when token invalid', async () => {
      const accountId = faker.string.uuid();
      const createAccountModel = buildAccountModel({ id: accountId });

      await AccountModel.save(createAccountModel);

      jest
        .spyOn(accountRepository, 'deleteAccount')
        .mockResolvedValueOnce(right(null));

      const response = await request(app.getHttpServer())
        .delete(`/account/${accountId}`)
        .set(`Authorization`, `Bearer ${tokenInvalid}`)
        .expect(401);

      expect(response.body.error).toEqual('Unauthorized');
      expect(response.body.message).toEqual(
        'JWT validation failed: UnauthorizedException: User can`t access',
      );
    });

    it('should delete account', async () => {
      const accountId = faker.string.uuid();
      const createAccountModel = buildAccountModel({ id: accountId });

      await AccountModel.save(createAccountModel);

      jest
        .spyOn(accountRepository, 'deleteAccount')
        .mockResolvedValueOnce(right(null));

      const response = await request(app.getHttpServer())
        .delete(`/account/${accountId}`)
        .set(`Authorization`, `Bearer ${token}`)
        .expect(200);

      expect(response.body).toEqual({});
    });
  });
});
