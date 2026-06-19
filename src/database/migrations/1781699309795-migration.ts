import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1781699309795 implements MigrationInterface {
  name = 'Migration1781699309795';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "gifting_events" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`,
    );
    await queryRunner.query(
      `ALTER TABLE "gifting_events" DROP CONSTRAINT "PK_c7a5a556a913955c7655d3e8f23"`,
    );
    await queryRunner.query(
      `ALTER TABLE "gifting_events" ADD CONSTRAINT "PK_e451e760f631cbe7dcd8beeb725" PRIMARY KEY ("event_id", "id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "gifting_events" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "gifting_events" ADD "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "gifting_events" ADD "deleted_at" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "gifting_events" ADD "created_by_id" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "gifting_events" ADD "updated_by_id" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "wishlist_items" DROP CONSTRAINT "FK_0e19e7c2decdc1d320508bec614"`,
    );
    await queryRunner.query(`DROP TABLE "wishlist_items"`);
    await queryRunner.query(
      `ALTER TABLE "wishlist_events" DROP CONSTRAINT "FK_7af64210be9ce4576cc20c20466"`,
    );
    await queryRunner.query(
      `ALTER TABLE "wishlist_events" DROP CONSTRAINT "PK_f849f25da901eeddbee94a336a9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "wishlist_events" DROP CONSTRAINT "UQ_wishlist_events_event_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "wishlist_events" ADD CONSTRAINT "PK_f849f25da901eeddbee94a336a9" PRIMARY KEY ("event_id", "id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "wishlist_events" ADD CONSTRAINT "FK_7af64210be9ce4576cc20c20466" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "wishlist_events" DROP CONSTRAINT "FK_7af64210be9ce4576cc20c20466"`,
    );
    await queryRunner.query(
      `ALTER TABLE "wishlist_events" DROP CONSTRAINT "PK_f849f25da901eeddbee94a336a9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "wishlist_events" ADD CONSTRAINT "UQ_wishlist_events_event_id" UNIQUE ("event_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "wishlist_events" ADD CONSTRAINT "PK_f849f25da901eeddbee94a336a9" PRIMARY KEY ("event_id", "id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "wishlist_events" ADD CONSTRAINT "FK_7af64210be9ce4576cc20c20466" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `CREATE TABLE "wishlist_items" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "created_by_id" uuid, "updated_by_id" uuid, "event_id" uuid NOT NULL, "itemName" character varying(255) NOT NULL, "itemUrl" text, "description" text, "estimatedPrice" numeric(12,2), "isReserved" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_0bd52924a97cda208ed2a07bd69" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "wishlist_items" ADD CONSTRAINT "FK_0e19e7c2decdc1d320508bec614" FOREIGN KEY ("event_id") REFERENCES "wishlist_events"("event_id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "gifting_events" DROP COLUMN "updated_by_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "gifting_events" DROP COLUMN "created_by_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "gifting_events" DROP COLUMN "deleted_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "gifting_events" DROP COLUMN "updated_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "gifting_events" DROP COLUMN "created_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "gifting_events" DROP CONSTRAINT "PK_e451e760f631cbe7dcd8beeb725"`,
    );
    await queryRunner.query(
      `ALTER TABLE "gifting_events" ADD CONSTRAINT "PK_c7a5a556a913955c7655d3e8f23" PRIMARY KEY ("event_id")`,
    );
    await queryRunner.query(`ALTER TABLE "gifting_events" DROP COLUMN "id"`);
  }
}
