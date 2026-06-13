import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1781038526208 implements MigrationInterface {
    name = 'Migration1781038526208'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "event_participants" ADD "is_pair_active" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "event_participants" DROP COLUMN "is_pair_active"`);
    }

}
