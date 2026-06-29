import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1782756000000 implements MigrationInterface {
  name = 'Migration1782756000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "relationships" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        "created_by_id" uuid,
        "updated_by_id" uuid,
        "name" character varying(100) NOT NULL,
        "description" text,
        "is_active" boolean NOT NULL DEFAULT true,
        CONSTRAINT "PK_relationships_id" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_relationships_created_by_name_unique"
      ON "relationships" ("created_by_id", "name")
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_relationships_global_name_unique"
      ON "relationships" ("name")
      WHERE "created_by_id" IS NULL
    `);
    await queryRunner.query(`
      ALTER TABLE "gifting_events"
      ADD COLUMN "relationship_id" uuid
    `);
    await queryRunner.query(`
      ALTER TABLE "gifting_events"
      ADD CONSTRAINT "FK_gifting_events_relationship_id"
      FOREIGN KEY ("relationship_id")
      REFERENCES "relationships"("id")
      ON DELETE SET NULL
      ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "gifting_events"
      DROP CONSTRAINT "FK_gifting_events_relationship_id"
    `);
    await queryRunner.query(`
      ALTER TABLE "gifting_events"
      DROP COLUMN "relationship_id"
    `);
    await queryRunner.query(`
      DROP INDEX "public"."IDX_relationships_global_name_unique"
    `);
    await queryRunner.query(`
      DROP INDEX "public"."IDX_relationships_created_by_name_unique"
    `);
    await queryRunner.query(`
      DROP TABLE "relationships"
    `);
  }
}
