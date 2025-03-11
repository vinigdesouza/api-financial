import { ApiProperty } from '@nestjs/swagger';
import {
  TransactionType,
  StatusTransaction,
} from '../../../domain/entity/transaction.entity';

export class TransactionResponseDto {
  @ApiProperty({ example: '990e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  accountId: string;

  @ApiProperty({ example: 100.5 })
  amount: number;

  @ApiProperty({ example: TransactionType.DEPOSIT, enum: TransactionType })
  transactionType: TransactionType;

  @ApiProperty({
    example: StatusTransaction.COMPLETED,
    enum: StatusTransaction,
  })
  status: StatusTransaction;

  @ApiProperty({ example: 'Salário do mês', required: false })
  description?: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440002',
    required: false,
  })
  destinationAccountId?: string;

  @ApiProperty({ example: '2025-03-10T14:50:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2025-03-10T15:10:00.000Z', required: false })
  updatedAt?: Date;
}
