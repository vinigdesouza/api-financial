import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Inject,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { CustomLogger } from 'src/modules/shared/custom.logger';
import { AccountRepositoryInterface } from '../../domain/repository/account.repository.interface';
import { Either, left, right } from 'src/modules/shared/either';
import { CreateAccountDTO } from '../dto/request/create.account.dto';
import { AccountResponse } from '../dto/response/account.response';
import { CreateAccountUsecase } from '../../application/usecase/create.account.usecase';
import { CreateAccountRequest } from '../../application/usecase/create.account.request';
import { InvalidAccountDataError } from '../../application/exceptions/InvalidAccountDataError';

@Controller('account')
export class AccountController {
  constructor(
    private readonly logger: CustomLogger,
    @Inject('AccountRepositoryInterface')
    private readonly accountRepository: AccountRepositoryInterface,
    @Inject() readonly createAccountUsecase: CreateAccountUsecase,
  ) {}

  @Get(':id')
  async findOne(
    @Param('id') id: string,
  ): Promise<
    Either<InternalServerErrorException | NotFoundException, AccountResponse>
  > {
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

  @Post()
  async create(
    @Body() createUsetDto: CreateAccountDTO,
  ): Promise<Either<Error | BadRequestException, AccountResponse>> {
    this.logger.log('Creating account');
    this.logger.log(`Request received: ${JSON.stringify(createUsetDto)}`);

    const usecaseRequest: CreateAccountRequest = {
      name: createUsetDto.name,
      accountNumber: createUsetDto.account_number,
      accountBalance: createUsetDto.account_balance,
      accountType: createUsetDto.account_type,
    };

    const response = await this.createAccountUsecase.handle(usecaseRequest);

    if (response.isLeft()) {
      if (response.value instanceof InvalidAccountDataError) {
        this.logger.error(
          'Invalid data when creating the account',
          response.value.message,
        );
        return left(new BadRequestException(response.value.message));
      }

      this.logger.error(
        'It was not possible to create the account',
        response.value.message,
      );
      return left(new InternalServerErrorException(response.value.message));
    }

    return right(AccountResponse.criar(response.value));
  }
}
