import {
  Controller,
  Get,
  Inject,
  InternalServerErrorException,
  NotFoundException,
  Param,
} from '@nestjs/common';
import { CustomLogger } from 'src/modules/shared/custom.logger';
import { AccountRepositoryInterface } from '../../domain/repository/account.repository.interface';
import { Either, left, right } from 'src/modules/shared/either';
import { AccountResponse } from '../dto/account.response';

@Controller('account')
export class AccountController {
  constructor(
    private readonly logger: CustomLogger,
    @Inject('AccountRepositoryInterface')
    private readonly accountRepository: AccountRepositoryInterface,
  ) {}

  @Get(':id')
  async findOne(
    @Param('id') id: string,
  ): Promise<Either<Error, AccountResponse | null>> {
    this.logger.log(`Finding account by id: ${id}`);
    const account = await this.accountRepository.findById(id);

    if (account.isLeft()) {
      this.logger.error(
        'It was not possible to retrieve the account',
        account.value.message,
      );
      return left(new InternalServerErrorException(account.value.message));
    }

    if (!account.value) {
      this.logger.warn(`Account with id ${id} not found`);
      return left(new NotFoundException());
    }

    return right(AccountResponse.criar(account.value));
  }
}
