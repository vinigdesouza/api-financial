import { Either } from 'src/modules/shared/either';

export interface CurrencyGatewayInterface {
  getCurrencyPrice(
    currency: string,
    targetCurrency: string,
  ): Promise<Either<Error, number>>;
}
