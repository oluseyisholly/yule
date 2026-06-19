import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1781785093526 implements MigrationInterface {
    name = 'Migration1781785093526'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."invitations_event_type_enum" AS ENUM('draw_name', 'wishlist', 'gifting')`);
        await queryRunner.query(`ALTER TABLE "invitations" ADD "event_type" "public"."invitations_event_type_enum" NOT NULL DEFAULT 'draw_name'`);
        await queryRunner.query(`ALTER TABLE "invitations" ADD "wishlist_event_id" uuid`);
        await queryRunner.query(`ALTER TABLE "invitations" ADD "gifting_event_id" uuid`);
        await queryRunner.query(`ALTER TABLE "invitations" DROP CONSTRAINT "FK_ce8234ea9beba9ad1f69afcaf01"`);
        await queryRunner.query(`ALTER TABLE "invitations" ALTER COLUMN "draw_name_event_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "invitations" ALTER COLUMN "participant_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "invitations" DROP CONSTRAINT "UQ_ce8234ea9beba9ad1f69afcaf01"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_73bcad8a301dc00ea0ccfd8da0" ON "invitations" ("event_id", "event_contact_id", "event_type") WHERE "event_contact_id" IS NOT NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_a39f99bbfd8823acf9f180f727" ON "invitations" ("participant_id", "event_type") WHERE "participant_id" IS NOT NULL`);
        await queryRunner.query(`ALTER TABLE "invitations" ADD CONSTRAINT "FK_ce8234ea9beba9ad1f69afcaf01" FOREIGN KEY ("participant_id") REFERENCES "event_participants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "invitations" DROP CONSTRAINT "FK_ce8234ea9beba9ad1f69afcaf01"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a39f99bbfd8823acf9f180f727"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_73bcad8a301dc00ea0ccfd8da0"`);
        await queryRunner.query(`ALTER TABLE "invitations" ADD CONSTRAINT "UQ_ce8234ea9beba9ad1f69afcaf01" UNIQUE ("participant_id")`);
        await queryRunner.query(`ALTER TABLE "invitations" ALTER COLUMN "participant_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "invitations" ALTER COLUMN "draw_name_event_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "invitations" ADD CONSTRAINT "FK_ce8234ea9beba9ad1f69afcaf01" FOREIGN KEY ("participant_id") REFERENCES "event_participants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "invitations" DROP COLUMN "gifting_event_id"`);
        await queryRunner.query(`ALTER TABLE "invitations" DROP COLUMN "wishlist_event_id"`);
        await queryRunner.query(`ALTER TABLE "invitations" DROP COLUMN "event_type"`);
        await queryRunner.query(`DROP TYPE "public"."invitations_event_type_enum"`);
    }

}
