import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1782060800000 implements MigrationInterface {
  name = 'Migration1782060800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "event_types" DROP CONSTRAINT IF EXISTS "UQ_d5110ab69f4aacfe41fecdf4fcd"`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_event_types_created_by_name_unique" ON "event_types" ("created_by_id", "name") WHERE "created_by_id" IS NOT NULL`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_event_types_global_name_unique" ON "event_types" ("name") WHERE "created_by_id" IS NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_event_types_global_name_unique"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_event_types_created_by_name_unique"`,
    );
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM pg_constraint
          WHERE conname = 'UQ_d5110ab69f4aacfe41fecdf4fcd'
            AND conrelid = 'event_types'::regclass
        ) THEN
          ALTER TABLE "event_types"
          ADD CONSTRAINT "UQ_d5110ab69f4aacfe41fecdf4fcd" UNIQUE ("name");
        END IF;
      END $$;
    `);
  }
}
