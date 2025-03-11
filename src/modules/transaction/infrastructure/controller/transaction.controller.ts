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
  UseGuards,
} from '@nestjs/common';
import { CustomLogger } from '../../../shared/custom.logger';
import { TransactionRepositoryInterface } from '../../domain/repository/transaction.repository.interface';
import { Transaction } from '../../domain/entity/transaction.entity';
import { CreateTransactionDTO } from '../dto/create.transaction.dto';
import { CreateTransactionUsecase } from '../../application/usecase/create.transaction.usecase';
import { AccountDoesNotExist } from '../../../account/application/exceptions/AccountDoesNotExist';
import { BalanceInsufficient } from '../../application/exceptions/BalanceInsufficient';
import { AdminGuard } from '../../../middleware/guards/admin.guard';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { TransactionResponseDto } from '../dto/response/transaction.response.dto';

@Controller('transaction')
export class TransactionController {
  constructor(
    private readonly logger: CustomLogger,
    @Inject('TransactionRepositoryInterface')
    private readonly transactionRepository: TransactionRepositoryInterface,
    @Inject() readonly createTransactionUsecase: CreateTransactionUsecase,
  ) {}

  @Get(':id')
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @ApiNotFoundResponse({ description: 'Not found' })
  @ApiOkResponse({ type: TransactionResponseDto })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<
    Error | InternalServerErrorException | NotFoundException | Transaction
  > {
    this.logger.log(`Finding transaction by id: ${id}`);
    const transaction = await this.transactionRepository.findById(id);

    if (transaction.isLeft()) {
      this.logger.error(
        'It was not possible to retrieve the transaction',
        transaction.value.message,
      );
      throw new InternalServerErrorException(transaction.value.message);
    }

    if (!transaction.value) {
      this.logger.warn(`transaction with id ${id} not found`);
      throw new NotFoundException();
    }

    return transaction.value;
  }

  @Get('account/:accountId')
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @ApiNotFoundResponse({ description: 'Not found' })
  @ApiOkResponse({ type: TransactionResponseDto, isArray: true })
  async findByAccount(
    @Param('accountId', ParseUUIDPipe) accountId: string,
  ): Promise<
    Error | InternalServerErrorException | NotFoundException | Transaction[]
  > {
    this.logger.log(`Finding transaction by account id: ${accountId}`);
    const transactions =
      await this.transactionRepository.findByAccountId(accountId);

    if (transactions.isLeft()) {
      this.logger.error(
        'It was not possible to retrieve the transaction',
        transactions.value.message,
      );
      throw new InternalServerErrorException(transactions.value.message);
    }

    if (transactions.value.length === 0) {
      this.logger.warn(`transactions with aacount id ${accountId} not found`);
      throw new NotFoundException();
    }

    return transactions.value;
  }

  @Post()
  @UseGuards(AdminGuard)
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @ApiNotFoundResponse({ description: 'Not found' })
  @ApiBadRequestResponse({ description: 'Bad request' })
  @ApiCreatedResponse()
  async create(
    @Body() createTransactionDto: CreateTransactionDTO,
  ): Promise<
    | Error
    | InternalServerErrorException
    | NotFoundException
    | BadRequestException
    | undefined
  > {
    this.logger.log('Creating transaction');

    const response =
      await this.createTransactionUsecase.handle(createTransactionDto);

    if (response.isLeft()) {
      this.logger.error(
        'It was not possible to create the transaction',
        response.value.message,
      );

      if (response.value instanceof AccountDoesNotExist) {
        throw new NotFoundException(response.value.message);
      }
      if (response.value instanceof BalanceInsufficient) {
        throw new BadRequestException(response.value.message);
      }

      throw new InternalServerErrorException(response.value.message);
    }

    return undefined;
  }

  @Delete(':id')
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @ApiOkResponse()
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<InternalServerErrorException | undefined> {
    this.logger.log(`Deleting transaction by id: ${id}`);
    const transactionDeleted =
      await this.transactionRepository.deleteTransaction(id);

    if (transactionDeleted.isLeft()) {
      this.logger.error(
        'It was not possible to delete transaction',
        transactionDeleted.value.message,
      );
      throw new InternalServerErrorException(transactionDeleted.value.message);
    }

    return undefined;
  }
}
