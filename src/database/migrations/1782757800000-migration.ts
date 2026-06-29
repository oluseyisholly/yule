import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1782757800000 implements MigrationInterface {
  name = 'Migration1782757800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "gifting_events"
      ADD COLUMN "minimum_gift_budget" numeric(12,2)
    `);
    await queryRunner.query(`
      ALTER TABLE "gifting_events"
      ADD COLUMN "maximum_gift_budget" numeric(12,2)
    `);
    await queryRunner.query(`
      UPDATE "gifting_events"
      SET
        "minimum_gift_budget" = "giftBudget",
        "maximum_gift_budget" = "giftBudget"
      WHERE "giftBudget" IS NOT NULL
    `);
    await queryRunner.query(`
      ALTER TABLE "gifting_events"
      DROP COLUMN "giftBudget"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "gifting_events"
      ADD COLUMN "giftBudget" numeric(12,2)
    `);
    await queryRunner.query(`
      UPDATE "gifting_events"
      SET "giftBudget" = COALESCE("maximum_gift_budget", "minimum_gift_budget")
      WHERE "minimum_gift_budget" IS NOT NULL
         OR "maximum_gift_budget" IS NOT NULL
    `);
    await queryRunner.query(`
      ALTER TABLE "gifting_events"
      DROP COLUMN "maximum_gift_budget"
    `);
    await queryRunner.query(`
      ALTER TABLE "gifting_events"
      DROP COLUMN "minimum_gift_budget"
    `);
  }
}
