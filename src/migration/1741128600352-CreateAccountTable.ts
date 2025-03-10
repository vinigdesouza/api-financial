import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAccountTable1741108788820 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS account (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        account_number INT,
        account_balance DECIMAL(10, 2) NOT NULL DEFAULT 0,
        account_type VARCHAR(255) CHECK (account_type IN ('CONTA_CORRENTE', 'CONTA_POUPANCA')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT NULL
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE account');
  }
}
