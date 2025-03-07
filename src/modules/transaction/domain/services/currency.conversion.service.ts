import { Inject, Injectable } from '@nestjs/common';
import { CurrencyGatewayInterface } from '../gateway/currency.gateway.interface';
import { CustomLogger } from '../../../shared/custom.logger';
import { Either, left, right } from '../../../shared/either';

@Injectable()
export class CurrencyConversionService {
  constructor(
    @Inject('CurrencyGatewayInterface')
    private readonly currencyGateway: CurrencyGatewayInterface,
    private readonly logger: CustomLogger,
  ) {}

  async convertCurrency(
    amount: number,
    currency: string,
    targetCurrency: string,
  ): Promise<Either<Error, number>> {
    this.logger.log(
      `Converting currency from ${currency} to ${targetCurrency}`,
    );

    const getCurrencyPrice = await this.currencyGateway.getCurrencyPrice(
      currency,
      targetCurrency,
    );
    if (getCurrencyPrice.isLeft()) {
      this.logger.error('Error fetching currency price');
      return left(new Error('Error fetching currency price'));
    }

    const convertedValue = amount * getCurrencyPrice.value;
    const roundedValue = parseFloat(convertedValue.toFixed(2));

    this.logger.log(`Converted value: ${roundedValue}`);
    return right(roundedValue);
  }
}
