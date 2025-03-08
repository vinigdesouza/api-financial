import { CurrencyConversionService } from '../../../transaction/domain/services/CurrencyConversionService';

export const convertCurrency: jest.Mock = jest.fn();

export const fakeCurrencyConversionService = <CurrencyConversionService>(<
  unknown
>{
  convertCurrency,
});
