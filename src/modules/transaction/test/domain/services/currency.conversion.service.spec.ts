import { Test, TestingModule } from '@nestjs/testing';
import { CustomLogger } from '../../../../shared/custom.logger';
import { left, right } from '../../../../shared/either';
import { faker } from '@faker-js/faker/.';
import { fakeLogger } from '../../../../shared/test/common.faker';
import { CurrencyConversionService } from '../../../domain/services/currency.conversion.service';
import { CurrencyTypes } from '../../../../transaction/domain/entity/transaction.entity';
import {
  fakeCurrencyGateway,
  getCurrencyPrice,
} from '../../../../shared/test/mocks/currency.gateway.mock';

describe('CurrencyConversionService', () => {
  let service: CurrencyConversionService;

  beforeEach(async () => {
    jest.useFakeTimers().setSystemTime(new Date('2025-02-01'));

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CurrencyConversionService,
        {
          provide: 'CurrencyGatewayInterface',
          useValue: fakeCurrencyGateway,
        },
        {
          provide: CustomLogger,
          useValue: fakeLogger,
        },
      ],
    }).compile();

    service = module.get<CurrencyConversionService>(CurrencyConversionService);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return an error when gateway return error ', async () => {
    const errorMesssage = faker.lorem.words();

    getCurrencyPrice.mockResolvedValueOnce(left(new Error(errorMesssage)));

    const result = await service.convertCurrency(
      200,
      CurrencyTypes.AMERICAN_DOLLAR,
      CurrencyTypes.REAL,
    );
    expect(result).toEqual(left(new Error('Error fetching currency price')));
    expect(getCurrencyPrice).toHaveBeenCalledTimes(1);
    expect(getCurrencyPrice.mock.calls[0][0]).toStrictEqual(
      CurrencyTypes.AMERICAN_DOLLAR,
    );
    expect(getCurrencyPrice.mock.calls[0][1]).toStrictEqual(CurrencyTypes.REAL);
  });

  it('should succesfuly the conversion amount', async () => {
    getCurrencyPrice.mockResolvedValueOnce(right(5.6));

    const result = await service.convertCurrency(
      200,
      CurrencyTypes.AMERICAN_DOLLAR,
      CurrencyTypes.REAL,
    );
    expect(result).toEqual(right(parseFloat((200 * 5.6).toFixed(2))));
    expect(getCurrencyPrice).toHaveBeenCalledTimes(1);
    expect(getCurrencyPrice.mock.calls[0][0]).toStrictEqual(
      CurrencyTypes.AMERICAN_DOLLAR,
    );
    expect(getCurrencyPrice.mock.calls[0][1]).toStrictEqual(CurrencyTypes.REAL);
  });
});
