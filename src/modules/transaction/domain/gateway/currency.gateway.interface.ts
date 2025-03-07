import { Either } from '../../../shared/either';

export interface CurrencyGatewayInterface {
  getCurrencyPrice(
    currency: string,
    targetCurrency: string,
  ): Promise<Either<Error, number>>;
}
