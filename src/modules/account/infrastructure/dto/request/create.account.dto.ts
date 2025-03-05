import { IsEnum, IsNumber, IsString, Min } from 'class-validator';
import { AccountType } from 'src/modules/account/domain/entity/account.entity';

export class CreateAccountDTO {
  @IsString()
  name: string;

  @IsNumber()
  account_number: number;

  @IsNumber()
  @Min(0)
  account_balance: number;

  @IsEnum(AccountType, { message: 'Invalid account type' })
  account_type: AccountType;
}
