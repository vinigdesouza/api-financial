import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import AccountModel from '../src/modules/account/infrastructure/models/account.model';
import { buildAccountModel } from '../src/modules/account/test/util/common.faker';
import { right } from '../src/modules/shared/either';
import { faker } from '@faker-js/faker/.';
import { TransactionRepositoryInterface } from '../src/modules/transaction/domain/repository/transaction.repository.interface';
import {
  buildCreateTransactionDTO,
  buildTransactionModel,
} from '../src/modules/shared/test/common.faker';
import TransactionModel from '../src/modules/transaction/infrastructure/models/transaction.model';
import { TransactionType } from '../src/modules/transaction/domain/entity/transaction.entity';

describe('AccountController (e2e)', () => {
  let app: INestApplication;
  let transactionRepository: TransactionRepositoryInterface;
  const token = process.env.AUTH_TOKEN;
  const tokenInvalid = process.env.AUTH_TOKEN_INVALID;

  beforeAll(async () => {
    // jest.useFakeTimers().setSystemTime(new Date('2025-02-01'));

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    transactionRepository = moduleFixture.get<TransactionRepositoryInterface>(
      'TransactionRepositoryInterface',
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /transaction/:id', () => {
    it('should return Unauthorized when token invalid', async () => {
      const transactionId = faker.string.uuid();

      const response = await request(app.getHttpServer())
        .get(`/transaction/${transactionId}`)
        .set(`Authorization`, `Bearer ${tokenInvalid}`)
        .expect(401);

      expect(response.body.message).toEqual(
        'JWT validation failed: UnauthorizedException: User can`t access',
      );
    });

    it('should return Unauthorized when token is missing', async () => {
      const transactionId = faker.string.uuid();

      const response = await request(app.getHttpServer())
        .get(`/transaction/${transactionId}`)
        .expect(401);

      expect(response.body.message).toEqual('Token is missing');
    });

    it('should return NotFoundException', async () => {
      const transactionId = faker.string.uuid();

      const response = await request(app.getHttpServer())
        .get(`/transaction/${transactionId}`)
        .set(`Authorization`, `Bearer ${token}`)
        .expect(404);

      expect(response.body.message).toEqual('Not Found');
    });

    it('should return transaction data', async () => {
      const transactionId = faker.string.uuid();
      const account = buildAccountModel({ id: faker.string.uuid() });
      await AccountModel.save(account);
      const createTransactionModel = buildTransactionModel({
        id: transactionId,
        account_id: account.id,
      });

      await TransactionModel.save(createTransactionModel);

      const response = await request(app.getHttpServer())
        .get(`/transaction/${transactionId}`)
        .set(`Authorization`, `Bearer ${token}`)
        .expect(200);

      expect(response.body).toEqual({
        id: transactionId,
        accountId: account.id,
        amount: Number(createTransactionModel.amount),
        transactionType: createTransactionModel.transaction_type,
        createdAt: createTransactionModel.created_at.toISOString(),
        updatedAt: createTransactionModel.updated_at?.toISOString(),
        status: createTransactionModel.status,
        destinationAccountId: null,
        description: null,
      });
    });
  });

  describe('GET /transaction/account/:accountId', () => {
    it('should return NotFoundException', async () => {
      const accountId = faker.string.uuid();

      jest
        .spyOn(transactionRepository, 'findByAccountId')
        .mockResolvedValueOnce(right([]));

      const response = await request(app.getHttpServer())
        .get(`/transaction/account/${accountId}`)
        .set(`Authorization`, `Bearer ${token}`)
        .expect(404);

      expect(response.body.message).toEqual('Not Found');
    });

    it('should return transaction data', async () => {
      const transactionId = faker.string.uuid();
      const account = buildAccountModel({ id: faker.string.uuid() });
      await AccountModel.save(account);
      const createTransactionModel = buildTransactionModel({
        id: transactionId,
        account_id: account.id,
      });

      await TransactionModel.save(createTransactionModel);

      const response = await request(app.getHttpServer())
        .get(`/transaction/account/${account.id}`)
        .set(`Authorization`, `Bearer ${token}`)
        .expect(200);

      expect(response.body).toEqual([
        {
          id: transactionId,
          accountId: account.id,
          amount: Number(createTransactionModel.amount),
          transactionType: createTransactionModel.transaction_type,
          createdAt: createTransactionModel.created_at.toISOString(),
          updatedAt: createTransactionModel.updated_at?.toISOString(),
          status: createTransactionModel.status,
          destinationAccountId: null,
          description: null,
        },
      ]);
    });
  });

  describe('POST /transaction', () => {
    it('should create a new transaction', async () => {
      const accountModel = buildAccountModel({
        account_balance: 1000,
      });
      const account = await AccountModel.save(accountModel);
      const CreateTransactionDTO = buildCreateTransactionDTO({
        account_id: account.id,
        amount: 100,
      });

      const response = await request(app.getHttpServer())
        .post('/transaction')
        .send(CreateTransactionDTO)
        .set(`Authorization`, `Bearer ${token}`)
        .expect(201);

      expect(response.body).toEqual({});

      await new Promise((resolve) => setTimeout(resolve, 1000));
    });

    it('should return BadRequestException', async () => {
      const accountModel = buildAccountModel({
        account_balance: 1000,
      });
      const account = await AccountModel.save(accountModel);
      const createTransactionDTO = buildCreateTransactionDTO({
        account_id: account.id,
        amount: 1200,
        transaction_type: TransactionType.WITHDRAW,
      });

      const response = await request(app.getHttpServer())
        .post('/transaction')
        .send(createTransactionDTO)
        .set(`Authorization`, `Bearer ${token}`)
        .expect(400);

      expect(response.body.message).toEqual(
        'Insufficient balance to make the transaction',
      );
      expect(response.body.error).toEqual('Bad Request');
    });

    it('should return BadRequestException', async () => {
      const idAccount = faker.string.uuid();
      const createTransactionDTO = buildCreateTransactionDTO({
        account_id: idAccount,
        amount: 1200,
        transaction_type: TransactionType.WITHDRAW,
      });

      const response = await request(app.getHttpServer())
        .post('/transaction')
        .send(createTransactionDTO)
        .set(`Authorization`, `Bearer ${token}`)
        .expect(404);

      expect(response.body.message).toEqual('Acount does not exist');
      expect(response.body.error).toEqual('Not Found');
    });
  });

  describe('DELETE /transaction/:id', () => {
    it('should return InternalServerErrorException', async () => {
      const transactionId = faker.string.uuid();

      const response = await request(app.getHttpServer())
        .delete(`/transaction/${transactionId}`)
        .set(`Authorization`, `Bearer ${token}`)
        .expect(500);

      expect(response.body.message).toEqual('Transaction not found');
      expect(response.body.error).toEqual('Internal Server Error');
    });

    it('should return Delete transaction', async () => {
      const transactionId = faker.string.uuid();
      const account = buildAccountModel({ id: faker.string.uuid() });
      await AccountModel.save(account);
      const createTransactionModel = buildTransactionModel({
        id: transactionId,
        account_id: account.id,
      });

      await TransactionModel.save(createTransactionModel);

      const response = await request(app.getHttpServer())
        .delete(`/transaction/${transactionId}`)
        .set(`Authorization`, `Bearer ${token}`)
        .expect(200);

      expect(response.body).toEqual({});
    });
  });
});
