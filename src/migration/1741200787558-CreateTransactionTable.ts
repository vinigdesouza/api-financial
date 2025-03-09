import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTransactionTable1741200787558 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

    await queryRunner.query(`CREATE TABLE IF NOT EXISTS transaction (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),        
        amount DECIMAL(15, 2) NOT NULL,                        
        account_id UUID NOT NULL,                               
        destination_account_id UUID,                            
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,        
        transaction_type VARCHAR(20) CHECK (transaction_type IN ('deposit', 'withdrawal', 'transfer')) NOT NULL, 
        status VARCHAR(20) CHECK (status IN ('pending', 'completed', 'failed')) DEFAULT 'pending', 
        description TEXT,                                      
        is_scheduled BOOLEAN DEFAULT FALSE,                    
        scheduled_date TIMESTAMP,                              
        recurrence_type VARCHAR(20) CHECK (recurrence_type IN ('daily', 'weekly', 'monthly', 'none')) DEFAULT 'none', 
        last_processed_date TIMESTAMP,                         

        CONSTRAINT fk_source_account FOREIGN KEY (account_id) REFERENCES account(id) ON DELETE CASCADE,
        CONSTRAINT fk_destination_account FOREIGN KEY (destination_account_id) REFERENCES account(id) ON DELETE SET NULL
    );`);

    await queryRunner.query(
      'CREATE INDEX idx_transactions_created_at ON transaction(created_at)',
    );
    await queryRunner.query(
      'CREATE INDEX idx_transactions_account_id ON transaction(account_id)',
    );
    await queryRunner.query(
      'CREATE INDEX idx_transactions_transaction_type ON transaction(transaction_type)',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX IF EXISTS idx_transactions_created_at');
    await queryRunner.query('DROP INDEX IF EXISTS idx_transactions_account_id');
    await queryRunner.query(
      'DROP INDEX IF EXISTS idx_transactions_transaction_type',
    );
    await queryRunner.query('DROP TABLE transaction');
  }
}
