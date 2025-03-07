import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { Account } from '../src/modules/account/domain/entity/account.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { v4 as uuidv4 } from 'uuid';
import { AccountRepositoryInterface } from '../src/modules/account/domain/repository/account.repository.interface';
import { CreateAccountTable1741108788820 } from '../src/migration/1741128600352-CreateAccountTable';
import AccountModel from '../src/modules/account/infrastructure/models/account.model';
import { buildAccountModel } from '../src/modules/account/test/util/common.faker';

describe('AccountController (e2e)', () => {
  let app: INestApplication;
  let accountRepository: AccountRepositoryInterface;
  const token = process.env.AUTH_TOKEN;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule,
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [Account],
          migrations: [CreateAccountTable1741108788820],
          synchronize: true,
          logging: true,
        }),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    accountRepository = moduleFixture.get<AccountRepositoryInterface>(
      'AccountRepositoryInterface',
    );
  });

  afterAll(async () => {
    await app.close();
  });

  // describe('POST /accounts', () => {
  //   it('should create a new account', async () => {
  //     const accountId = uuidv4(); // Gerando ID único para o teste

  //     const createAccountDto = {
  //       id: accountId,
  //       name: 'Test Account',
  //       account_number: '123456',
  //       account_balance: 1000,
  //       account_type: 'SAVINGS',
  //     };

  //     // Enviando a requisição POST com o Supertest
  //     const response = await request(app.getHttpServer())
  //       .post('/accounts')
  //       .send(createAccountDto) // Envia os dados para criar a conta
  //       .expect(201);

  //     // Verifica a resposta
  //     expect(response.body).toEqual({
  //       id: expect.any(String),
  //       name: createAccountDto.name,
  //       account_number: createAccountDto.account_number,
  //       account_balance: createAccountDto.account_balance,
  //       account_type: createAccountDto.account_type,
  //       created_at: expect.any(String),
  //       updated_at: expect.any(String),
  //     });
  //   });
  // });

  describe('GET /accounts/:id', () => {
    it('should return account data', async () => {
      const accountId = uuidv4();
      const createAccountModel = buildAccountModel({ id: accountId });

      await AccountModel.save(createAccountModel);

      const response = await request(app.getHttpServer())
        .get(`/account/${accountId}`)
        .set(`Authorization`, `Bearer ${token}`)
        .expect(200);

      expect(response.body).toEqual({
        value: {
          id: accountId,
          name: createAccountModel.name,
          accountNumber: createAccountModel.account_number,
          accountBalance: createAccountModel.account_balance,
          accountType: createAccountModel.account_type,
          createdAt: expect.any(String),
        },
      });
    });
  });
});
