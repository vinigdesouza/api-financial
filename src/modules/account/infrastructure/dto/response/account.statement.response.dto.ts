import { ApiPropertyOptional } from '@nestjs/swagger';
import { TransactionResponseDto } from '../../../../transaction/infrastructure/dto/response/transaction.response.dto';
import { AccountResponseDto } from './account.response.dto';

export class AccountStatementResponseDto extends AccountResponseDto {
  @ApiPropertyOptional({ type: [TransactionResponseDto], required: false })
  transactions?: TransactionResponseDto[];
}
