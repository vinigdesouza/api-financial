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
  Query,
} from '@nestjs/common';
import { CustomLogger } from '../../../shared/custom.logger';
import { AccountRepositoryInterface } from '../../domain/repository/account.repository.interface';
import { CreateAccountDTO } from '../dto/request/create.account.dto';
import { CreateAccountUsecase } from '../../application/usecase/create.account.usecase';
import { UpsertAccountRequest } from '../../application/usecase/upsert.account.request';
import { InvalidAccountDataError } from '../../application/exceptions/InvalidAccountDataError';
import { UpdateAccountUsecase } from '../../application/usecase/update.account.usecase';
import { AccountDoesNotExist } from '../../application/exceptions/AccountDoesNotExist';
import { Account } from '../../domain/entity/account.entity';

@Controller('account')
export class AccountController {
  constructor(
    private readonly logger: CustomLogger,
    @Inject('AccountRepositoryInterface')
    private readonly accountRepository: AccountRepositoryInterface,
    @Inject() readonly createAccountUsecase: CreateAccountUsecase,
    @Inject() readonly updateAccountUsecase: UpdateAccountUsecase,
  ) {}

  @Get('statement')
  async generateAccountStatement(
    @Query('account_number') accountNumber: string,
    @Query('start_date') startDate: string,
    @Query('end_date') endDate: string,
    @Query('account_id') accountId?: string,
    @Query('transaction_type') transactionType?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('sort_by') sortBy?: string,
    @Query('sort_order') sortOrder?: 'ASC' | 'DESC',
  ): Promise<InternalServerErrorException | Account[]> {
    this.logger.log('Generating account statement');

    const statement = await this.accountRepository.getAccountStatement({
      accountNumber: parseInt(accountNumber),
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      accountId: accountId,
      transactionType,
      limit: limit ? parseInt(limit, 10) : 10,
      offset: offset ? parseInt(offset, 10) : 0,
      sortBy: sortBy || 'createdAt',
      sortOrder:
        sortOrder && ['ASC', 'DESC'].includes(sortOrder.toUpperCase())
          ? (sortOrder.toUpperCase() as 'ASC' | 'DESC')
          : 'DESC',
    });

    if (statement.isLeft()) {
      this.logger.error(
        'Error when generating account statement',
        statement.value.message,
      );
      throw new InternalServerErrorException(statement.value.message);
    }

    return statement.value;
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<
    Error | InternalServerErrorException | NotFoundException | Account
  > {
    this.logger.log(`Finding account by id: ${id}`);
    const account = await this.accountRepository.findById(id);

    if (account.isLeft()) {
      this.logger.error(
        'It was not possible to retrieve the account',
        account.value.message,
      );
      throw new InternalServerErrorException(account.value.message);
    }

    if (!account.value) {
      this.logger.warn(`Account with id ${id} not found`);
      throw new NotFoundException();
    }

    return account.value;
  }

  @Post()
  async create(
    @Body() createAccountDto: CreateAccountDTO,
  ): Promise<Error | BadRequestException | undefined> {
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
        throw new BadRequestException(response.value.message);
      }

      this.logger.error(
        'It was not possible to create the account',
        response.value.message,
      );
      throw new InternalServerErrorException(response.value.message);
    }

    return undefined;
  }

  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUsetDto: CreateAccountDTO,
  ): Promise<Error | BadRequestException | NotFoundException | Account> {
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
        throw new BadRequestException(response.value.message);
      }

      if (response.value instanceof AccountDoesNotExist) {
        this.logger.error('Account does not exist', response.value.message);
        throw new NotFoundException(response.value.message);
      }

      this.logger.error(
        'It was not possible to update the account',
        response.value.message,
      );
      throw new InternalServerErrorException(response.value.message);
    }

    return response.value;
  }

  @Delete(':id')
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<InternalServerErrorException | undefined> {
    this.logger.log(`Deleting account by id: ${id}`);
    const accountDeleted = await this.accountRepository.deleteAccount(id);

    if (accountDeleted.isLeft()) {
      this.logger.error(
        'It was not possible to retrieve the account',
        accountDeleted.value.message,
      );
      throw new InternalServerErrorException(accountDeleted.value.message);
    }

    return undefined;
  }
}
