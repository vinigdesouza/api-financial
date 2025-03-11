import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateIf,
} from 'class-validator';
import {
  CurrencyTypes,
  TransactionType,
} from '../../domain/entity/transaction.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTransactionDTO {
  @ApiProperty({
    example: '259b6067-a89e-4a95-a883-9241b12450d1',
    description: 'Account ID for the transaction',
    required: true,
  })
  @IsUUID('4', { message: 'Account ID must be a valid UUID' })
  @IsNotEmpty({ message: 'Account ID is required' })
  account_id: string;

  @ApiProperty({ example: 100, required: true })
  @IsNumber(
    { allowInfinity: false, allowNaN: false },
    { message: 'Amount must be a valid number' },
  )
  @Min(0, { message: 'Amount cannot be negative' })
  amount: number;

  @ApiProperty({
    enum: [
      TransactionType.TRANSFER,
      TransactionType.DEPOSIT,
      TransactionType.WITHDRAW,
    ],
    required: true,
  })
  @IsEnum(TransactionType, { message: 'Invalid transaction type' })
  transaction_type: TransactionType;

  @ApiProperty({
    enum: [
      CurrencyTypes.REAL,
      CurrencyTypes.AMERICAN_DOLLAR,
      CurrencyTypes.EURO,
    ],
    required: true,
  })
  @IsEnum(CurrencyTypes, { message: 'Invalid currency type' })
  currency: CurrencyTypes;

  @ApiPropertyOptional({
    required: false,
    example: '60612c34-d7b5-45ac-ada9-da676b60ac63',
    description:
      'Destination Account ID for transfers, should be sended if transaction_type is TRANSFER',
  })
  @ValidateIf((o) => o.transaction_type === TransactionType.TRANSFER)
  @IsUUID('4', { message: 'Destination Account ID must be a valid UUID' })
  @IsNotEmpty({ message: 'Destination Account ID is required for transfers' })
  destination_account_id?: string;

  @ApiPropertyOptional({
    required: false,
    example: 'Transaction description',
    description: 'Description for the transaction',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    required: false,
    example: '2021-01-01 00:00:00.00',
    description:
      'Scheduled date for the transaction, if not provided, the transaction will be executed immediately',
  })
  @IsOptional()
  @IsString({ message: 'Scheduled date must be a valid string date' })
  scheduled_at?: string;
}
