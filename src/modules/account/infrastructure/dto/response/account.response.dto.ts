import { ApiProperty } from '@nestjs/swagger';
import { AccountType } from '../../..//domain/entity/account.entity';

export class AccountResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: 'John Doe' })
  name: string;

  @ApiProperty({ example: 123456 })
  accountNumber: number;

  @ApiProperty({ example: 1000.5 })
  accountBalance: number;

  @ApiProperty({ example: AccountType.CONTA_CORRENTE, enum: AccountType })
  accountType: AccountType;

  @ApiProperty({ example: '2025-03-10T14:48:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2025-03-10T15:00:00.000Z', required: false })
  updatedAt: Date;
}
