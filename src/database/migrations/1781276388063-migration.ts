import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1781276388063 implements MigrationInterface {
  name = 'Migration1781276388063';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "wishlist_items" DROP CONSTRAINT "FK_0e19e7c2decdc1d320508bec614"`,
    );
    await queryRunner.query(
      `ALTER TABLE "wishlist_events" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`,
    );
    await queryRunner.query(
      `ALTER TABLE "wishlist_events" DROP CONSTRAINT "PK_7af64210be9ce4576cc20c20466"`,
    );
    await queryRunner.query(
      `ALTER TABLE "wishlist_events" ADD CONSTRAINT "PK_f849f25da901eeddbee94a336a9" PRIMARY KEY ("event_id", "id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "wishlist_events" ADD CONSTRAINT "UQ_wishlist_events_event_id" UNIQUE ("event_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "wishlist_items" ADD CONSTRAINT "FK_0e19e7c2decdc1d320508bec614" FOREIGN KEY ("event_id") REFERENCES "wishlist_events"("event_id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "wishlist_events" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "wishlist_events" ADD "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "wishlist_events" ADD "deleted_at" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "wishlist_events" ADD "created_by_id" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "wishlist_events" ADD "updated_by_id" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "wishlist_events" ADD "eventDeadline" TIMESTAMP`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "wishlist_items" DROP CONSTRAINT "FK_0e19e7c2decdc1d320508bec614"`,
    );
    await queryRunner.query(
      `ALTER TABLE "wishlist_events" DROP COLUMN "eventDeadline"`,
    );
    await queryRunner.query(
      `ALTER TABLE "wishlist_events" DROP COLUMN "updated_by_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "wishlist_events" DROP COLUMN "created_by_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "wishlist_events" DROP COLUMN "deleted_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "wishlist_events" DROP COLUMN "updated_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "wishlist_events" DROP COLUMN "created_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "wishlist_events" DROP CONSTRAINT "PK_f849f25da901eeddbee94a336a9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "wishlist_events" DROP CONSTRAINT "UQ_wishlist_events_event_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "wishlist_events" ADD CONSTRAINT "PK_7af64210be9ce4576cc20c20466" PRIMARY KEY ("event_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "wishlist_items" ADD CONSTRAINT "FK_0e19e7c2decdc1d320508bec614" FOREIGN KEY ("event_id") REFERENCES "wishlist_events"("event_id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(`ALTER TABLE "wishlist_events" DROP COLUMN "id"`);
  }
}
