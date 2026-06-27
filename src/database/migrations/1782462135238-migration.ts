import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1782462135238 implements MigrationInterface {
    name = 'Migration1782462135238'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "hangout_events" ADD "hangout_event_id" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "hangout_events" ADD "check_in_date" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "hangout_events" ADD "check_out_date" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "hangout_events" ADD "number_of_guests" integer`);
        await queryRunner.query(`ALTER TABLE "hangout_events" ADD "amount" numeric(12,2)`);
        await queryRunner.query(`ALTER TABLE "hangout_events" ADD "image_url" text`);
        await queryRunner.query(`ALTER TYPE "public"."events_event_option_enum" RENAME TO "events_event_option_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."events_event_option_enum" AS ENUM('draw_name', 'wishlist', 'gifting', 'hangout')`);
        await queryRunner.query(`ALTER TABLE "events" ALTER COLUMN "event_option" TYPE "public"."events_event_option_enum" USING "event_option"::"text"::"public"."events_event_option_enum"`);
        await queryRunner.query(`DROP TYPE "public"."events_event_option_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."events_event_option_enum_old" AS ENUM('draw_name', 'wishlist', 'gifting')`);
        await queryRunner.query(`ALTER TABLE "events" ALTER COLUMN "event_option" TYPE "public"."events_event_option_enum_old" USING "event_option"::"text"::"public"."events_event_option_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."events_event_option_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."events_event_option_enum_old" RENAME TO "events_event_option_enum"`);
        await queryRunner.query(`ALTER TABLE "hangout_events" DROP COLUMN "image_url"`);
        await queryRunner.query(`ALTER TABLE "hangout_events" DROP COLUMN "amount"`);
        await queryRunner.query(`ALTER TABLE "hangout_events" DROP COLUMN "number_of_guests"`);
        await queryRunner.query(`ALTER TABLE "hangout_events" DROP COLUMN "check_out_date"`);
        await queryRunner.query(`ALTER TABLE "hangout_events" DROP COLUMN "check_in_date"`);
        await queryRunner.query(`ALTER TABLE "hangout_events" DROP COLUMN "hangout_event_id"`);
    }

}
