import { CurrencyConversionService } from '../../../transaction/domain/services/currency.conversion.service';

export const convertCurrency: jest.Mock = jest.fn();

export const fakeCurrencyConversionService = <CurrencyConversionService>(<
  unknown
>{
  convertCurrency,
});
