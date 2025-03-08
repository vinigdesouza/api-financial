import { Injectable } from '@nestjs/common';
import { CurrencyGatewayInterface } from '../../domain/gateway/currency.gateway.interface';
import { CustomLogger } from '../../../shared/custom.logger';
import { Either, left, right } from '../../../shared/either';
import axios, { AxiosRequestConfig } from 'axios';

const HOST_API_CURRENCY_CONVERSION = String(
  process.env.HOST_API_CURRENCY_CONVERSION,
);

@Injectable()
export class CurrencyGateway implements CurrencyGatewayInterface {
  private readonly timeoutInSeconds = 20;

  constructor(private readonly logger: CustomLogger) {}

  async getCurrencyPrice(
    currency: string,
    targetCurrency: string,
  ): Promise<Either<Error, number>> {
    this.logger.log(
      `Getting currency price for ${currency} to ${targetCurrency}`,
    );

    const options: AxiosRequestConfig = {
      headers: {
        Accept: 'application/json',
      },
      timeout: this.timeoutInSeconds * 1000,
    };

    const url = `${HOST_API_CURRENCY_CONVERSION}/${currency}-${targetCurrency}`;

    try {
      const { data } = await axios.get(url, options);

      this.logger.log('Resposta da api de conversão de moeda', `data: ${data}`);
      if (!data) {
        throw new Error('Error fetching currency price');
      }

      return right(Number(data[currency + targetCurrency].ask));
    } catch (error) {
      this.logger.error(`Unexpected error: ${error}`);
      return left(new Error('Error fetching currency price'));
    }
  }
}
