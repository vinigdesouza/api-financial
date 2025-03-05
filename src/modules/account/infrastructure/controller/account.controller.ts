import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  InternalServerErrorException,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
} from '@nestjs/common';
import { CustomLogger } from 'src/modules/shared/custom.logger';
import { AccountRepositoryInterface } from '../../domain/repository/account.repository.interface';
import { Either, left, right } from 'src/modules/shared/either';
import { CreateAccountDTO } from '../dto/request/create.account.dto';
import { AccountResponse } from '../dto/response/account.response';
import { CreateAccountUsecase } from '../../application/usecase/create.account.usecase';
import { UpsertAccountRequest } from '../../application/usecase/upsert.account.request';
import { InvalidAccountDataError } from '../../application/exceptions/InvalidAccountDataError';
import { UpdateAccountUsecase } from '../../application/usecase/update.account.usecase';
import { AccountDoesNotExist } from '../../application/exceptions/AccountDoesNotExist';
import { validate as isUUID } from 'uuid';

@Controller('account')
export class AccountController {
  constructor(
    private readonly logger: CustomLogger,
    @Inject('AccountRepositoryInterface')
    private readonly accountRepository: AccountRepositoryInterface,
    @Inject() readonly createAccountUsecase: CreateAccountUsecase,
    @Inject() readonly updateAccountUsecase: UpdateAccountUsecase,
  ) {}

  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
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
    @Body() createAccountDto: CreateAccountDTO,
  ): Promise<Either<Error | BadRequestException, undefined>> {
    this.logger.log('Creating account');
    this.logger.log(`Creating account for user: ${createAccountDto.name}`);

    const usecaseRequest: UpsertAccountRequest = {
      name: createAccountDto.name,
      accountNumber: createAccountDto.account_number,
      accountBalance: createAccountDto.account_balance,
      accountType: createAccountDto.account_type,
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

    return right(undefined);
  }

  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUsetDto: CreateAccountDTO,
  ): Promise<
    Either<Error | BadRequestException | NotFoundException, AccountResponse>
  > {
    this.logger.log('Updating account controller');
    this.logger.log(`Updating account for user: ${updateUsetDto.name}`);

    const usecaseRequest: UpsertAccountRequest = {
      name: updateUsetDto.name,
      accountNumber: updateUsetDto.account_number,
      accountBalance: updateUsetDto.account_balance,
      accountType: updateUsetDto.account_type,
    };

    const response = await this.updateAccountUsecase.handle(id, usecaseRequest);

    if (response.isLeft()) {
      if (response.value instanceof InvalidAccountDataError) {
        this.logger.error(
          'Invalid data when updating the account',
          response.value.message,
        );
        return left(new BadRequestException(response.value.message));
      }

      if (response.value instanceof AccountDoesNotExist) {
        this.logger.error('Account does not exist', response.value.message);
        return left(new NotFoundException(response.value.message));
      }

      this.logger.error(
        'It was not possible to update the account',
        response.value.message,
      );
      return left(new InternalServerErrorException(response.value.message));
    }

    return right(AccountResponse.criar(response.value));
  }

  @Delete(':id')
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<Either<InternalServerErrorException, undefined>> {
    this.logger.log(`Deleting account by id: ${id}`);
    const accountDeleted = await this.accountRepository.delete(id);

    if (accountDeleted.isLeft()) {
      this.logger.error(
        'It was not possible to retrieve the account',
        accountDeleted.value.message,
      );
      return left(
        new InternalServerErrorException(accountDeleted.value.message),
      );
    }

    return right(undefined);
  }
}
