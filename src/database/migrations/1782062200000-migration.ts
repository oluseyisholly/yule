import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1782062200000 implements MigrationInterface {
  name = 'Migration1782062200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_type WHERE typname = 'events_event_option_enum'
        ) THEN
          CREATE TYPE "public"."events_event_option_enum" AS ENUM (
            'draw_name',
            'wishlist',
            'gifting'
          );
        END IF;
      END $$;
    `);
    await queryRunner.query(
      `ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "event_option" "public"."events_event_option_enum"`,
    );
    await queryRunner.query(`
      UPDATE "events" "event"
      SET "event_option" = 'draw_name'
      WHERE "event_option" IS NULL
        AND EXISTS (
          SELECT 1
          FROM "draw_name_events" "drawNameEvent"
          WHERE "drawNameEvent"."event_id" = "event"."id"
        )
    `);
    await queryRunner.query(`
      UPDATE "events" "event"
      SET "event_option" = 'wishlist'
      WHERE "event_option" IS NULL
        AND EXISTS (
          SELECT 1
          FROM "wishlist_events" "wishlistEvent"
          WHERE "wishlistEvent"."event_id" = "event"."id"
        )
    `);
    await queryRunner.query(`
      UPDATE "events" "event"
      SET "event_option" = 'gifting'
      WHERE "event_option" IS NULL
        AND EXISTS (
          SELECT 1
          FROM "gifting_events" "giftingEvent"
          WHERE "giftingEvent"."event_id" = "event"."id"
        )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "events" DROP COLUMN IF EXISTS "event_option"`,
    );
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."events_event_option_enum"`);
  }
}
