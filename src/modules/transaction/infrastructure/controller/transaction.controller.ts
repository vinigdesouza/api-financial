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
} from '@nestjs/common';
import { CustomLogger } from 'src/modules/shared/custom.logger';
import { Either, left, right } from 'src/modules/shared/either';
import { TransactionRepositoryInterface } from '../../domain/repository/transaction.repository.interface';
import { Transaction } from '../../domain/entity/transaction.entity';
import { CreateTransactionDTO } from '../dto/create.transaction.dto';
import { CreateTransactionUsecase } from '../../application/usecase/create.transaction.usecase';
import { AccountDoesNotExist } from 'src/modules/account/application/exceptions/AccountDoesNotExist';
import { BalanceInsufficient } from '../../application/exceptions/BalanceInsufficient';

@Controller('transaction')
export class TransactionController {
  constructor(
    private readonly logger: CustomLogger,
    @Inject('TransactionRepositoryInterface')
    private readonly transactionRepository: TransactionRepositoryInterface,
    @Inject() readonly createTransactionUsecase: CreateTransactionUsecase,
  ) {}

  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<
    Either<
      Error | InternalServerErrorException | NotFoundException,
      Transaction
    >
  > {
    this.logger.log(`Finding transaction by id: ${id}`);
    const transaction = await this.transactionRepository.findById(id);

    if (transaction.isLeft()) {
      this.logger.error(
        'It was not possible to retrieve the transaction',
        transaction.value.message,
      );
      return left(new InternalServerErrorException(transaction.value.message));
    }

    if (!transaction.value) {
      this.logger.warn(`transaction with id ${id} not found`);
      return left(new NotFoundException());
    }

    return right(transaction.value);
  }

  @Get('account/:accountId')
  async findByAccount(
    @Param('accountId', ParseUUIDPipe) accountId: string,
  ): Promise<
    Either<
      Error | InternalServerErrorException | NotFoundException,
      Transaction[]
    >
  > {
    this.logger.log(`Finding transaction by account id: ${accountId}`);
    const transactions =
      await this.transactionRepository.findByAccountId(accountId);

    if (transactions.isLeft()) {
      this.logger.error(
        'It was not possible to retrieve the transaction',
        transactions.value.message,
      );
      return left(new InternalServerErrorException(transactions.value.message));
    }

    if (!transactions.value) {
      this.logger.warn(`transactions with aacount id ${accountId} not found`);
      return left(new NotFoundException());
    }

    return right(transactions.value);
  }

  @Post()
  async create(
    @Body() createTransactionDto: CreateTransactionDTO,
  ): Promise<
    Either<Error | NotFoundException | BadRequestException, Transaction>
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
        return left(new NotFoundException(response.value.message));
      }
      if (response.value instanceof BalanceInsufficient) {
        return left(new BadRequestException(response.value.message));
      }

      return left(new Error(response.value.message));
    }

    return right(response.value);
  }

  @Delete(':id')
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<Either<InternalServerErrorException, undefined>> {
    this.logger.log(`Deleting transaction by id: ${id}`);
    const transactionDeleted = await this.transactionRepository.delete(id);

    if (transactionDeleted.isLeft()) {
      this.logger.error(
        'It was not possible to delete transaction',
        transactionDeleted.value.message,
      );
      return left(
        new InternalServerErrorException(transactionDeleted.value.message),
      );
    }

    return right(undefined);
  }
}
