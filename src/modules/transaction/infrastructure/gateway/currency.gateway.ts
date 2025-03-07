import { Injectable } from '@nestjs/common';
import { CurrencyGatewayInterface } from '../../domain/gateway/currency.gateway.interface';
import { CustomLogger } from '../../../shared/custom.logger';
import { Either, left, right } from '../../../shared/either';
import { HttpService } from '@nestjs/axios';
import { AxiosError } from 'axios';

@Injectable()
export class CurrencyGateway implements CurrencyGatewayInterface {
  constructor(
    private readonly logger: CustomLogger,
    private readonly httpService: HttpService,
  ) {}

  async getCurrencyPrice(
    currency: string,
    targetCurrency: string,
  ): Promise<Either<Error, number>> {
    this.logger.log(
      `Getting currency price for ${currency} to ${targetCurrency}`,
    );

    try {
      const response = await this.httpService.axiosRef.get(
        `https://economia.awesomeapi.com.br/last/${currency}-${targetCurrency}`,
      );
      if (!response || !response.data) {
        throw new Error('No response or response data');
      }

      return right(response.data[currency + targetCurrency].ask);
    } catch (error) {
      if (error instanceof AxiosError) {
        this.logger.error(`Error fetching currency price: ${error.message}`);
        return left(new Error('Error fetching currency price'));
      }
      this.logger.error(`Unexpected error: ${error}`);
      return left(new Error('Unexpected error occurred'));
    }
  }
}
