import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1780976066512 implements MigrationInterface {
    name = 'Migration1780976066512'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."invitations_status_enum" AS ENUM('pending', 'accepted')`);
        await queryRunner.query(`CREATE TYPE "public"."invitations_channel_enum" AS ENUM('email', 'whatsapp')`);
        await queryRunner.query(`CREATE TABLE "invitations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "created_by_id" uuid, "updated_by_id" uuid, "draw_name_event_id" uuid NOT NULL, "event_id" uuid NOT NULL, "participant_id" uuid NOT NULL, "event_contact_id" uuid, "token" character varying(128) NOT NULL, "status" "public"."invitations_status_enum" NOT NULL DEFAULT 'pending', "channel" "public"."invitations_channel_enum" NOT NULL DEFAULT 'email', "invite_url" text NOT NULL, "sent_at" TIMESTAMP WITH TIME ZONE, "accepted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "UQ_e577dcf9bb6d084373ed3998509" UNIQUE ("token"), CONSTRAINT "UQ_ce8234ea9beba9ad1f69afcaf01" UNIQUE ("participant_id"), CONSTRAINT "PK_5dec98cfdfd562e4ad3648bbb07" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_e577dcf9bb6d084373ed399850" ON "invitations" ("token") `);
        await queryRunner.query(`ALTER TABLE "invitations" ADD CONSTRAINT "FK_d4dcb14581e4fafa601e15e3533" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "invitations" ADD CONSTRAINT "FK_ce8234ea9beba9ad1f69afcaf01" FOREIGN KEY ("participant_id") REFERENCES "event_participants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "invitations" ADD CONSTRAINT "FK_b07ea63fad85fbf54a1161d1575" FOREIGN KEY ("event_contact_id") REFERENCES "contacts"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "invitations" DROP CONSTRAINT "FK_b07ea63fad85fbf54a1161d1575"`);
        await queryRunner.query(`ALTER TABLE "invitations" DROP CONSTRAINT "FK_ce8234ea9beba9ad1f69afcaf01"`);
        await queryRunner.query(`ALTER TABLE "invitations" DROP CONSTRAINT "FK_d4dcb14581e4fafa601e15e3533"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e577dcf9bb6d084373ed399850"`);
        await queryRunner.query(`DROP TABLE "invitations"`);
        await queryRunner.query(`DROP TYPE "public"."invitations_channel_enum"`);
        await queryRunner.query(`DROP TYPE "public"."invitations_status_enum"`);
    }

}
