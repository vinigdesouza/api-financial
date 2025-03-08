/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { CustomLogger } from '../../../../shared/custom.logger';
import { left, right } from '../../../../shared/either';
import { faker } from '@faker-js/faker/.';
import { fakeLogger } from '../../../../shared/test/common.faker';
import { CurrencyTypes } from '../../../../transaction/domain/entity/transaction.entity';
import { CurrencyGateway } from '../../../infrastructure/gateway/currency.gateway';
jest.mock('axios');
import axios, { AxiosRequestConfig } from 'axios';

describe('CurrencyGateway', () => {
  let gateway: CurrencyGateway;

  beforeEach(async () => {
    jest.useFakeTimers().setSystemTime(new Date('2025-02-01'));

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CurrencyGateway,
        {
          provide: CustomLogger,
          useValue: fakeLogger,
        },
      ],
    }).compile();

    gateway = module.get<CurrencyGateway>(CurrencyGateway);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return an error when api fails ', async () => {
    const errorMessage = faker.lorem.words();
    const currency = CurrencyTypes.AMERICAN_DOLLAR;
    const targetCurrency = CurrencyTypes.REAL;

    const options: AxiosRequestConfig = {
      headers: { Accept: 'application/json' },
      timeout: 20000,
    };

    axios.get = jest.fn().mockImplementation(() => {
      throw new Error(errorMessage);
    });

    await expect(
      gateway.getCurrencyPrice(currency, targetCurrency),
    ).resolves.toStrictEqual(left(new Error('Error fetching currency price')));
    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith(
      `${process.env.HOST_API_CURRENCY_CONVERSION}/${currency}-${targetCurrency}`,
      options,
    );
  });

  it('should return the conversion amount', async () => {
    const currency = CurrencyTypes.AMERICAN_DOLLAR;
    const targetCurrency = CurrencyTypes.REAL;

    axios.get = jest.fn().mockResolvedValueOnce({
      data: {
        USDBRL: {
          ask: '5.7894',
        },
      },
    });

    await expect(
      gateway.getCurrencyPrice(currency, targetCurrency),
    ).resolves.toStrictEqual(right(5.7894));
    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith(
      `${process.env.HOST_API_CURRENCY_CONVERSION}/${currency}-${targetCurrency}`,
      {
        headers: { Accept: 'application/json' },
        timeout: 20000,
      },
    );
  });
});
