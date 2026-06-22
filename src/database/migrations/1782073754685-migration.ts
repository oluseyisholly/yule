import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1782073754685 implements MigrationInterface {
  name = 'Migration1782073754685';

  public async up(_queryRunner: QueryRunner): Promise<void> {
    // Intentionally left empty.
    // Migration1782062200000 already creates events.event_option and backfills it.
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    // Intentionally left empty because this migration does not own any schema changes.
  }
}
