import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateScheduledTransactionTable1741549013470
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS scheduled_transaction (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        transaction_id UUID NOT NULL,
        scheduled_at TIMESTAMP NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_transaction FOREIGN KEY (transaction_id) REFERENCES transaction(id) ON DELETE CASCADE
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS scheduled_transaction;`);
  }
}
