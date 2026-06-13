import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1780936284391 implements MigrationInterface {
    name = 'Migration1780936284391'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "event_gifts" DROP CONSTRAINT "FK_02141c491401698e6e2d216f7f1"`);
        await queryRunner.query(`ALTER TABLE "event_gifts" DROP COLUMN "delivered_at"`);
        await queryRunner.query(`ALTER TABLE "event_gifts" DROP COLUMN "actual_amount"`);
        await queryRunner.query(`ALTER TABLE "event_gifts" DROP COLUMN "source"`);
        await queryRunner.query(`DROP TYPE "public"."event_gifts_source_enum"`);
        await queryRunner.query(`ALTER TABLE "event_gifts" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "public"."event_gifts_status_enum"`);
        await queryRunner.query(`ALTER TABLE "event_gifts" DROP COLUMN "purchased_at"`);
        await queryRunner.query(`ALTER TABLE "event_gifts" DROP COLUMN "gift_url"`);
        await queryRunner.query(`ALTER TABLE "event_gifts" ADD "participant_gift_id" character varying(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "event_gifts" ADD "amount" numeric(12,2) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "event_gifts" ADD "category_slug" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "event_gifts" ADD "sub_category_slug" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "event_gifts" ADD "condition" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "event_gifts" ADD "location_state" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "event_gifts" ADD "location_city" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "event_gifts" ADD "seller_id" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "event_gifts" ADD "product_slug" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "event_gifts" ALTER COLUMN "recipient_participant_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "event_gifts" ADD CONSTRAINT "FK_02141c491401698e6e2d216f7f1" FOREIGN KEY ("recipient_participant_id") REFERENCES "event_participants"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "event_gifts" DROP CONSTRAINT "FK_02141c491401698e6e2d216f7f1"`);
        await queryRunner.query(`ALTER TABLE "event_gifts" ALTER COLUMN "recipient_participant_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "event_gifts" DROP COLUMN "product_slug"`);
        await queryRunner.query(`ALTER TABLE "event_gifts" DROP COLUMN "seller_id"`);
        await queryRunner.query(`ALTER TABLE "event_gifts" DROP COLUMN "location_city"`);
        await queryRunner.query(`ALTER TABLE "event_gifts" DROP COLUMN "location_state"`);
        await queryRunner.query(`ALTER TABLE "event_gifts" DROP COLUMN "condition"`);
        await queryRunner.query(`ALTER TABLE "event_gifts" DROP COLUMN "sub_category_slug"`);
        await queryRunner.query(`ALTER TABLE "event_gifts" DROP COLUMN "category_slug"`);
        await queryRunner.query(`ALTER TABLE "event_gifts" DROP COLUMN "amount"`);
        await queryRunner.query(`ALTER TABLE "event_gifts" DROP COLUMN "participant_gift_id"`);
        await queryRunner.query(`ALTER TABLE "event_gifts" ADD "gift_url" text`);
        await queryRunner.query(`ALTER TABLE "event_gifts" ADD "purchased_at" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`CREATE TYPE "public"."event_gifts_status_enum" AS ENUM('pending', 'reserved', 'purchased', 'delivered', 'cancelled')`);
        await queryRunner.query(`ALTER TABLE "event_gifts" ADD "status" "public"."event_gifts_status_enum" NOT NULL DEFAULT 'pending'`);
        await queryRunner.query(`CREATE TYPE "public"."event_gifts_source_enum" AS ENUM('wishlist', 'draw_name', 'auto_gifting', 'direct_gifting')`);
        await queryRunner.query(`ALTER TABLE "event_gifts" ADD "source" "public"."event_gifts_source_enum" NOT NULL DEFAULT 'direct_gifting'`);
        await queryRunner.query(`ALTER TABLE "event_gifts" ADD "actual_amount" numeric(12,2)`);
        await queryRunner.query(`ALTER TABLE "event_gifts" ADD "delivered_at" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "event_gifts" ADD CONSTRAINT "FK_02141c491401698e6e2d216f7f1" FOREIGN KEY ("recipient_participant_id") REFERENCES "event_participants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
