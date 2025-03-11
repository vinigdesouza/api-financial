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
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { AccountStatementDto } from '../dto/request/account-statement.dto';
import { AccountResponseDto } from '../dto/response/account.response.dto';
import { AccountStatementResponseDto } from '../dto/response/account.statement.response.dto';

@ApiBearerAuth()
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
  @ApiQuery({
    name: 'account_number',
    required: true,
    example: '123456',
    description: 'Número da conta',
  })
  @ApiQuery({
    name: 'start_date',
    required: true,
    example: '2025-03-01T00:00:00.000Z',
    description: 'Data inicial',
  })
  @ApiQuery({
    name: 'end_date',
    required: true,
    example: '2025-03-10T23:59:59.999Z',
    description: 'Data final',
  })
  @ApiQuery({
    name: 'account_id',
    required: false,
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID da conta',
  })
  @ApiQuery({
    name: 'transaction_type',
    required: false,
    example: 'DEPOSIT',
    description: 'Tipo de transação',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    example: 10,
    description: 'Limite de registros',
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    example: 0,
    description: 'Offset para paginação',
  })
  @ApiQuery({
    name: 'sort_by',
    required: false,
    example: 'createdAt',
    description: 'Campo para ordenação',
  })
  @ApiQuery({
    name: 'sort_order',
    required: false,
    enum: ['ASC', 'DESC'],
    example: 'ASC',
    description: 'Ordem de ordenação',
  })
  @ApiOkResponse({ type: AccountStatementResponseDto, isArray: true })
  async generateAccountStatement(
    @Query() filters: AccountStatementDto,
  ): Promise<InternalServerErrorException | Account[]> {
    this.logger.log('Generating account statement');

    const statement = await this.accountRepository.getAccountStatement({
      accountNumber: parseInt(filters.account_number),
      startDate: new Date(filters.start_date),
      endDate: new Date(filters.end_date),
      accountId: filters.account_id,
      transactionType: filters.transaction_type,
      limit: filters.limit ? parseInt(filters.limit) : 10,
      offset: filters.offset ? parseInt(filters.offset) : 0,
      sortBy: filters.sort_by || 'created_at',
      sortOrder:
        filters.sort_order && ['ASC', 'DESC'].includes(filters.sort_order)
          ? filters.sort_order
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
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @ApiNotFoundResponse({ description: 'Not Found' })
  @ApiOkResponse({ type: AccountResponseDto })
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
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiOkResponse({ description: 'Created' })
  async create(
    @Body() createAccountDto: CreateAccountDTO,
  ): Promise<
    Error | InternalServerErrorException | BadRequestException | undefined
  > {
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
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiNotFoundResponse({ description: 'Not Found' })
  @ApiOkResponse({ type: AccountResponseDto })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUsetDto: CreateAccountDTO,
  ): Promise<
    | Error
    | InternalServerErrorException
    | BadRequestException
    | NotFoundException
    | Account
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
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @ApiOkResponse()
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
