import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1780654278439 implements MigrationInterface {
    name = 'Migration1780654278439'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "event_participants" ADD "is_notified" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "event_participants" DROP COLUMN "is_notified"`);
    }

}
