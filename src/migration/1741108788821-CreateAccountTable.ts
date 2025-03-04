import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAccountTable1741108788820 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE account (
          id UUID PRIMARY KEY,
          name VARCHAR(255),
          account_number INT,
          account_balance DECIMAL(10, 2),
          account_type VARCHAR(255) CHECK (account_type IN ('CONTA_CORRENTE', 'CONTA_POUPANCA')),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP
        );
      `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('drop table account');
  }
}
