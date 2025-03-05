import {
  IsEnum,
  IsInt,
  IsNumber,
  IsString,
  Min,
  IsNotEmpty,
} from 'class-validator';
import { AccountType } from 'src/modules/account/domain/entity/account.entity';

export class CreateAccountDTO {
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @IsInt({ message: 'Account number must be an integer' })
  @Min(1, { message: 'Account number must be positive' })
  account_number: number;

  @IsNumber(
    { allowInfinity: false, allowNaN: false },
    { message: 'Account balance must be a valid number' },
  )
  @Min(0, { message: 'Account balance cannot be negative' })
  account_balance: number;

  @IsEnum(AccountType, { message: 'Invalid account type' })
  account_type: AccountType;
}
