import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsUUID,
  IsEnum,
  IsNumberString,
  IsDateString,
} from 'class-validator';

export class AccountStatementDto {
  @ApiProperty({ example: '123456' })
  @IsNumberString()
  account_number: string;

  @ApiProperty({ example: '2025-03-01T00:00:00.000Z' })
  @IsDateString()
  start_date: string;

  @ApiProperty({ example: '2025-03-10T23:59:59.999Z' })
  @IsDateString()
  end_date: string;

  @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsOptional()
  @IsUUID()
  account_id?: string;

  @ApiPropertyOptional({ example: 'DEPOSIT' })
  @IsOptional()
  transaction_type?: string;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @IsNumberString()
  limit?: string;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsNumberString()
  offset?: string;

  @ApiPropertyOptional({ example: 'createdAt' })
  @IsOptional()
  sort_by?: string;

  @ApiPropertyOptional({ example: 'ASC', enum: ['ASC', 'DESC'] })
  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sort_order?: 'ASC' | 'DESC';
}
