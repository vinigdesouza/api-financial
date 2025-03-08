import { CurrencyGatewayInterface } from '../../../transaction/domain/gateway/currency.gateway.interface';

export const getCurrencyPrice: jest.Mock = jest.fn();

export const fakeCurrencyGateway = <CurrencyGatewayInterface>(<unknown>{
  getCurrencyPrice,
});
