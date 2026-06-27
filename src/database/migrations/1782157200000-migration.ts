import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1782157200000 implements MigrationInterface {
  name = 'Migration1782157200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "hangout_events" ADD COLUMN IF NOT EXISTS "event_center_name" character varying(255)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "hangout_events" DROP COLUMN IF EXISTS "event_center_name"`,
    );
  }
}
