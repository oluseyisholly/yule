import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1782745780833 implements MigrationInterface {
    name = 'Migration1782745780833'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "gifting_events" DROP CONSTRAINT "FK_gifting_events_relationship_id"`);
        await queryRunner.query(`ALTER TABLE "relationships" RENAME COLUMN "is_active" TO "isActive"`);
        await queryRunner.query(`ALTER TABLE "gifting_events" ALTER COLUMN "minimum_gift_budget" TYPE numeric(15,2)`);
        await queryRunner.query(`ALTER TABLE "gifting_events" ALTER COLUMN "maximum_gift_budget" TYPE numeric(15,2)`);
        await queryRunner.query(`ALTER TABLE "gifting_events" ADD CONSTRAINT "FK_3a8cdea3f8658e9016d41b505e0" FOREIGN KEY ("relationship_id") REFERENCES "relationships"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "gifting_events" DROP CONSTRAINT "FK_3a8cdea3f8658e9016d41b505e0"`);
        await queryRunner.query(`ALTER TABLE "gifting_events" ALTER COLUMN "maximum_gift_budget" TYPE numeric(12,2)`);
        await queryRunner.query(`ALTER TABLE "gifting_events" ALTER COLUMN "minimum_gift_budget" TYPE numeric(12,2)`);
        await queryRunner.query(`ALTER TABLE "relationships" RENAME COLUMN "isActive" TO "is_active"`);
        await queryRunner.query(`ALTER TABLE "gifting_events" ADD CONSTRAINT "FK_gifting_events_relationship_id" FOREIGN KEY ("relationship_id") REFERENCES "relationships"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

}
