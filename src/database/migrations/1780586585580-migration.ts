import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1780586585580 implements MigrationInterface {
    name = 'Migration1780586585580'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."contacts_gender_enum" AS ENUM('male', 'female')`);
        await queryRunner.query(`CREATE TABLE "contacts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "created_by_id" uuid, "updated_by_id" uuid, "firstName" character varying(255) NOT NULL, "lastName" character varying(255) NOT NULL, "email" character varying(255), "gender" "public"."contacts_gender_enum" NOT NULL, "phoneNumber" character varying(50), "user_id" character varying(255), "note" text, CONSTRAINT "UQ_ec583107c1975d1da04d74d19d2" UNIQUE ("created_by_id", "email"), CONSTRAINT "PK_b99cd40cfd66a99f1571f4f72e6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_9c0c25028ecc9fb008ac1bcb27" ON "contacts" ("created_by_id", "phoneNumber") `);
        await queryRunner.query(`CREATE INDEX "IDX_ec583107c1975d1da04d74d19d" ON "contacts" ("created_by_id", "email") `);
        await queryRunner.query(`CREATE TABLE "event_types" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "created_by_id" uuid, "updated_by_id" uuid, "name" character varying(100) NOT NULL, "key" character varying(100), "description" text, "isActive" boolean NOT NULL DEFAULT true, CONSTRAINT "UQ_d5110ab69f4aacfe41fecdf4fcd" UNIQUE ("name"), CONSTRAINT "UQ_b5856e50c25e4c9db291d0dada9" UNIQUE ("key"), CONSTRAINT "PK_ffe6b2d60596409fb08fb13830d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "created_by_id" uuid, "updated_by_id" uuid, "firstName" character varying(150) NOT NULL, "lastName" character varying(150) NOT NULL, "phoneNumber" character varying(20) NOT NULL, "email" character varying(255) NOT NULL, "password" character varying(255) NOT NULL, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."event_gifts_source_enum" AS ENUM('wishlist', 'draw_name', 'auto_gifting', 'direct_gifting')`);
        await queryRunner.query(`CREATE TYPE "public"."event_gifts_status_enum" AS ENUM('pending', 'reserved', 'purchased', 'delivered', 'cancelled')`);
        await queryRunner.query(`CREATE TABLE "event_gifts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "created_by_id" uuid, "updated_by_id" uuid, "event_id" uuid NOT NULL, "recipient_participant_id" uuid NOT NULL, "giver_participant_id" uuid, "title" character varying(255) NOT NULL, "description" text, "image_url" text, "gift_url" text, "actual_amount" numeric(12,2), "currency" character varying(10) NOT NULL DEFAULT 'NGN', "source" "public"."event_gifts_source_enum" NOT NULL DEFAULT 'direct_gifting', "status" "public"."event_gifts_status_enum" NOT NULL DEFAULT 'pending', "purchased_at" TIMESTAMP WITH TIME ZONE, "delivered_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_16fa8fbb25326583af88b4b260c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."event_participants_role_enum" AS ENUM('creator', 'host', 'co_host', 'participant')`);
        await queryRunner.query(`CREATE TABLE "event_participants" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "created_by_id" uuid, "updated_by_id" uuid, "event_id" uuid NOT NULL, "user_id" uuid, "event_contact_id" uuid, "gift_giver_participant_id" uuid, "role" "public"."event_participants_role_enum" NOT NULL DEFAULT 'participant', CONSTRAINT "PK_b65ffd558d76fd51baffe81d42b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "hangout_events" ("event_id" uuid NOT NULL, "location" text, "maxAttendees" integer, "allowPlusOne" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_21a1f873a47a8d173b71037e637" PRIMARY KEY ("event_id"))`);
        await queryRunner.query(`CREATE TABLE "gifting_events" ("event_id" uuid NOT NULL, "giftBudget" numeric(12,2), "currency" character varying(10) NOT NULL DEFAULT 'NGN', "giftDeadline" TIMESTAMP, "allowAnonymousGifting" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_c7a5a556a913955c7655d3e8f23" PRIMARY KEY ("event_id"))`);
        await queryRunner.query(`CREATE TABLE "draw_name_events" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "created_by_id" uuid, "updated_by_id" uuid, "event_id" uuid NOT NULL, "location" character varying(255), "drawDate" TIMESTAMP, "maximum_spend" numeric(12,2), "budget" numeric(12,2), "allowSelfDraw" boolean NOT NULL DEFAULT false, "isDrawCompleted" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_5c7b8f11a5409c3a53e66c98f4d" PRIMARY KEY ("id", "event_id"))`);
        await queryRunner.query(`CREATE TYPE "public"."event_logs_action_enum" AS ENUM('event_created', 'event_updated', 'participant_added', 'participant_removed', 'participant_accepted', 'wishlist_item_added', 'wishlist_item_updated', 'wishlist_item_reserved', 'wishlist_item_completed', 'draw_names_completed', 'gift_item_completed')`);
        await queryRunner.query(`CREATE TABLE "event_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "created_by_id" uuid, "updated_by_id" uuid, "event_id" uuid NOT NULL, "actor_user_id" uuid, "actor_participant_id" uuid, "action" "public"."event_logs_action_enum" NOT NULL, "title" character varying(255) NOT NULL, "description" text, "target_id" uuid, "target_type" character varying(100), "metadata" jsonb, CONSTRAINT "PK_b09cf1bb58150797d898076b242" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "events" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "created_by_id" uuid, "updated_by_id" uuid, "title" character varying(255) NOT NULL, "description" text, "event_type_id" uuid NOT NULL, "eventDate" TIMESTAMP, "status" character varying(100) NOT NULL DEFAULT 'draft', CONSTRAINT "PK_40731c7151fe4be3116e45ddf73" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "wishlist_events" ("event_id" uuid NOT NULL, "allowMultipleItems" boolean NOT NULL DEFAULT true, "visibility" character varying(50) NOT NULL DEFAULT 'private', CONSTRAINT "PK_7af64210be9ce4576cc20c20466" PRIMARY KEY ("event_id"))`);
        await queryRunner.query(`CREATE TABLE "wishlist_items" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "created_by_id" uuid, "updated_by_id" uuid, "event_id" uuid NOT NULL, "itemName" character varying(255) NOT NULL, "itemUrl" text, "description" text, "estimatedPrice" numeric(12,2), "isReserved" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_0bd52924a97cda208ed2a07bd69" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."scheduled_event_messages_status_enum" AS ENUM('pending', 'sent', 'failed', 'cancelled')`);
        await queryRunner.query(`CREATE TABLE "scheduled_event_messages" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "created_by_id" uuid, "updated_by_id" uuid, "event_id" uuid NOT NULL, "participant_id" uuid, "subject" character varying(255) NOT NULL, "message" text NOT NULL, "recipient_email" character varying(255) NOT NULL, "recipient_name" character varying(255), "scheduled_at" TIMESTAMP WITH TIME ZONE NOT NULL, "sent_at" TIMESTAMP WITH TIME ZONE, "status" "public"."scheduled_event_messages_status_enum" NOT NULL DEFAULT 'pending', "gift_url" text, "gift_url_expires_at" TIMESTAMP WITH TIME ZONE, "metadata" jsonb, "failure_reason" text, CONSTRAINT "PK_42058bd4625ce3742b9ae7de7db" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "event_participant_exclusions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "created_by_id" uuid, "updated_by_id" uuid, "event_id" uuid NOT NULL, "participant_one_id" uuid NOT NULL, "participant_two_id" uuid NOT NULL, CONSTRAINT "UQ_2376f9d033be55f08ade628d8fe" UNIQUE ("event_id", "participant_one_id", "participant_two_id"), CONSTRAINT "PK_85215d60f54bfe895b603419b59" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_edab44e98cde1ecba8a1d6b19d" ON "event_participant_exclusions" ("event_id", "participant_two_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_6c416fe6e86a9de3f2c594f3e1" ON "event_participant_exclusions" ("event_id", "participant_one_id") `);
        await queryRunner.query(`CREATE TABLE "contact_connections" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "created_by_id" uuid, "updated_by_id" uuid, "owner_contact_id" uuid NOT NULL, "contact_id" uuid NOT NULL, CONSTRAINT "UQ_6dbfc2befcef5a3846b2c7c245a" UNIQUE ("owner_contact_id", "contact_id"), CONSTRAINT "PK_884a23938419c2b5307504c6d0d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_e4330f7f1737ff7ce14127bee3" ON "contact_connections" ("contact_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_2605ced69a8d457ddbf7df694b" ON "contact_connections" ("owner_contact_id") `);
        await queryRunner.query(`ALTER TABLE "event_gifts" ADD CONSTRAINT "FK_7eade7893e0f77f54c9e2953a07" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "event_gifts" ADD CONSTRAINT "FK_02141c491401698e6e2d216f7f1" FOREIGN KEY ("recipient_participant_id") REFERENCES "event_participants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "event_gifts" ADD CONSTRAINT "FK_5d6ac4c02a1f17f1d088cbb4864" FOREIGN KEY ("giver_participant_id") REFERENCES "event_participants"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "event_participants" ADD CONSTRAINT "FK_b5349807aae71193d0cc0f52e35" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "event_participants" ADD CONSTRAINT "FK_ce3f433e47fdd8f072964293c8d" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "event_participants" ADD CONSTRAINT "FK_4375bf5903a300e0f070020e9b8" FOREIGN KEY ("event_contact_id") REFERENCES "contacts"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "event_participants" ADD CONSTRAINT "FK_edcacc1384d445b6739eca6a3de" FOREIGN KEY ("gift_giver_participant_id") REFERENCES "event_participants"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "hangout_events" ADD CONSTRAINT "FK_21a1f873a47a8d173b71037e637" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "gifting_events" ADD CONSTRAINT "FK_c7a5a556a913955c7655d3e8f23" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "draw_name_events" ADD CONSTRAINT "FK_b9b1c3e37469b8085d80e063877" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "event_logs" ADD CONSTRAINT "FK_1d0af93b9a23814cf546e45f5c9" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "event_logs" ADD CONSTRAINT "FK_d7c34c2926f0b915848d4f8ce86" FOREIGN KEY ("actor_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "event_logs" ADD CONSTRAINT "FK_033a2e9454c7c35590c536e58d9" FOREIGN KEY ("actor_participant_id") REFERENCES "event_participants"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "events" ADD CONSTRAINT "FK_cca2d7a421ac4b1b24b9996d101" FOREIGN KEY ("event_type_id") REFERENCES "event_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "events" ADD CONSTRAINT "FK_08e606dc5182b142dc916e7abab" FOREIGN KEY ("created_by_id") REFERENCES "contacts"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "wishlist_events" ADD CONSTRAINT "FK_7af64210be9ce4576cc20c20466" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "wishlist_items" ADD CONSTRAINT "FK_0e19e7c2decdc1d320508bec614" FOREIGN KEY ("event_id") REFERENCES "wishlist_events"("event_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "scheduled_event_messages" ADD CONSTRAINT "FK_8bf0cf95fd5c1fa949312bbe7ac" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "scheduled_event_messages" ADD CONSTRAINT "FK_324a449523b8e7b6a01745fee7c" FOREIGN KEY ("participant_id") REFERENCES "event_participants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "event_participant_exclusions" ADD CONSTRAINT "FK_e561d01943566ead101b5b6ed60" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "event_participant_exclusions" ADD CONSTRAINT "FK_7c4f2d0f57ccac7d23c9e2ce099" FOREIGN KEY ("participant_one_id") REFERENCES "event_participants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "event_participant_exclusions" ADD CONSTRAINT "FK_22b49ffda3abdcf32fcea07e03c" FOREIGN KEY ("participant_two_id") REFERENCES "event_participants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "contact_connections" ADD CONSTRAINT "FK_2605ced69a8d457ddbf7df694b3" FOREIGN KEY ("owner_contact_id") REFERENCES "contacts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "contact_connections" ADD CONSTRAINT "FK_e4330f7f1737ff7ce14127bee33" FOREIGN KEY ("contact_id") REFERENCES "contacts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "contact_connections" DROP CONSTRAINT "FK_e4330f7f1737ff7ce14127bee33"`);
        await queryRunner.query(`ALTER TABLE "contact_connections" DROP CONSTRAINT "FK_2605ced69a8d457ddbf7df694b3"`);
        await queryRunner.query(`ALTER TABLE "event_participant_exclusions" DROP CONSTRAINT "FK_22b49ffda3abdcf32fcea07e03c"`);
        await queryRunner.query(`ALTER TABLE "event_participant_exclusions" DROP CONSTRAINT "FK_7c4f2d0f57ccac7d23c9e2ce099"`);
        await queryRunner.query(`ALTER TABLE "event_participant_exclusions" DROP CONSTRAINT "FK_e561d01943566ead101b5b6ed60"`);
        await queryRunner.query(`ALTER TABLE "scheduled_event_messages" DROP CONSTRAINT "FK_324a449523b8e7b6a01745fee7c"`);
        await queryRunner.query(`ALTER TABLE "scheduled_event_messages" DROP CONSTRAINT "FK_8bf0cf95fd5c1fa949312bbe7ac"`);
        await queryRunner.query(`ALTER TABLE "wishlist_items" DROP CONSTRAINT "FK_0e19e7c2decdc1d320508bec614"`);
        await queryRunner.query(`ALTER TABLE "wishlist_events" DROP CONSTRAINT "FK_7af64210be9ce4576cc20c20466"`);
        await queryRunner.query(`ALTER TABLE "events" DROP CONSTRAINT "FK_08e606dc5182b142dc916e7abab"`);
        await queryRunner.query(`ALTER TABLE "events" DROP CONSTRAINT "FK_cca2d7a421ac4b1b24b9996d101"`);
        await queryRunner.query(`ALTER TABLE "event_logs" DROP CONSTRAINT "FK_033a2e9454c7c35590c536e58d9"`);
        await queryRunner.query(`ALTER TABLE "event_logs" DROP CONSTRAINT "FK_d7c34c2926f0b915848d4f8ce86"`);
        await queryRunner.query(`ALTER TABLE "event_logs" DROP CONSTRAINT "FK_1d0af93b9a23814cf546e45f5c9"`);
        await queryRunner.query(`ALTER TABLE "draw_name_events" DROP CONSTRAINT "FK_b9b1c3e37469b8085d80e063877"`);
        await queryRunner.query(`ALTER TABLE "gifting_events" DROP CONSTRAINT "FK_c7a5a556a913955c7655d3e8f23"`);
        await queryRunner.query(`ALTER TABLE "hangout_events" DROP CONSTRAINT "FK_21a1f873a47a8d173b71037e637"`);
        await queryRunner.query(`ALTER TABLE "event_participants" DROP CONSTRAINT "FK_edcacc1384d445b6739eca6a3de"`);
        await queryRunner.query(`ALTER TABLE "event_participants" DROP CONSTRAINT "FK_4375bf5903a300e0f070020e9b8"`);
        await queryRunner.query(`ALTER TABLE "event_participants" DROP CONSTRAINT "FK_ce3f433e47fdd8f072964293c8d"`);
        await queryRunner.query(`ALTER TABLE "event_participants" DROP CONSTRAINT "FK_b5349807aae71193d0cc0f52e35"`);
        await queryRunner.query(`ALTER TABLE "event_gifts" DROP CONSTRAINT "FK_5d6ac4c02a1f17f1d088cbb4864"`);
        await queryRunner.query(`ALTER TABLE "event_gifts" DROP CONSTRAINT "FK_02141c491401698e6e2d216f7f1"`);
        await queryRunner.query(`ALTER TABLE "event_gifts" DROP CONSTRAINT "FK_7eade7893e0f77f54c9e2953a07"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_2605ced69a8d457ddbf7df694b"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e4330f7f1737ff7ce14127bee3"`);
        await queryRunner.query(`DROP TABLE "contact_connections"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_6c416fe6e86a9de3f2c594f3e1"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_edab44e98cde1ecba8a1d6b19d"`);
        await queryRunner.query(`DROP TABLE "event_participant_exclusions"`);
        await queryRunner.query(`DROP TABLE "scheduled_event_messages"`);
        await queryRunner.query(`DROP TYPE "public"."scheduled_event_messages_status_enum"`);
        await queryRunner.query(`DROP TABLE "wishlist_items"`);
        await queryRunner.query(`DROP TABLE "wishlist_events"`);
        await queryRunner.query(`DROP TABLE "events"`);
        await queryRunner.query(`DROP TABLE "event_logs"`);
        await queryRunner.query(`DROP TYPE "public"."event_logs_action_enum"`);
        await queryRunner.query(`DROP TABLE "draw_name_events"`);
        await queryRunner.query(`DROP TABLE "gifting_events"`);
        await queryRunner.query(`DROP TABLE "hangout_events"`);
        await queryRunner.query(`DROP TABLE "event_participants"`);
        await queryRunner.query(`DROP TYPE "public"."event_participants_role_enum"`);
        await queryRunner.query(`DROP TABLE "event_gifts"`);
        await queryRunner.query(`DROP TYPE "public"."event_gifts_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."event_gifts_source_enum"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "event_types"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ec583107c1975d1da04d74d19d"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_9c0c25028ecc9fb008ac1bcb27"`);
        await queryRunner.query(`DROP TABLE "contacts"`);
        await queryRunner.query(`DROP TYPE "public"."contacts_gender_enum"`);
    }

}
