import {
  IsEnum,
  IsInt,
  IsNumber,
  IsString,
  Min,
  IsNotEmpty,
} from 'class-validator';
import { AccountType } from '../../../domain/entity/account.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAccountDTO {
  @ApiProperty({
    example: 'John Doe',
    description: 'Account holder name',
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @ApiProperty({
    example: 123456,
    description: 'Account number',
    required: true,
  })
  @IsInt({ message: 'Account number must be an integer' })
  @Min(1, { message: 'Account number must be positive' })
  account_number: number;

  @ApiProperty({
    example: 100,
    description: 'Initial account balance',
    required: true,
  })
  @IsNumber(
    { allowInfinity: false, allowNaN: false },
    { message: 'Account balance must be a valid number' },
  )
  @Min(0, { message: 'Account balance cannot be negative' })
  account_balance: number;

  @ApiProperty({
    enum: [AccountType.CONTA_CORRENTE, AccountType.CONTA_POUPANCA],
    required: true,
  })
  @IsEnum(AccountType, { message: 'Invalid account type' })
  account_type: AccountType;
}
