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

export class CreateTransactionDTO {
  @IsUUID('4', { message: 'Account ID must be a valid UUID' })
  @IsNotEmpty({ message: 'Account ID is required' })
  account_id: string;

  @IsNumber(
    { allowInfinity: false, allowNaN: false },
    { message: 'Amount must be a valid number' },
  )
  @Min(0, { message: 'Amount cannot be negative' })
  amount: number;

  @IsEnum(TransactionType, { message: 'Invalid transaction type' })
  transaction_type: TransactionType;

  @IsEnum(CurrencyTypes, { message: 'Invalid currency type' })
  currency: CurrencyTypes;

  @ValidateIf((o) => o.transaction_type === TransactionType.TRANSFER)
  @IsUUID('4', { message: 'Destination Account ID must be a valid UUID' })
  @IsNotEmpty({ message: 'Destination Account ID is required for transfers' })
  destination_account_id?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString({ message: 'Scheduled date must be a valid string date' })
  scheduled_at?: string;
}
