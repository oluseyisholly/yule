import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1782589390528 implements MigrationInterface {
    name = 'Migration1782589390528'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "hangout_events" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "hangout_events" DROP CONSTRAINT "PK_21a1f873a47a8d173b71037e637"`);
        await queryRunner.query(`ALTER TABLE "hangout_events" ADD CONSTRAINT "PK_c8ba153b2cb1d4c7f15e90df57c" PRIMARY KEY ("event_id", "id")`);
        await queryRunner.query(`ALTER TABLE "hangout_events" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "hangout_events" ADD "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "hangout_events" ADD "deleted_at" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "hangout_events" ADD "created_by_id" uuid`);
        await queryRunner.query(`ALTER TABLE "hangout_events" ADD "updated_by_id" uuid`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "hangout_events" DROP COLUMN "updated_by_id"`);
        await queryRunner.query(`ALTER TABLE "hangout_events" DROP COLUMN "created_by_id"`);
        await queryRunner.query(`ALTER TABLE "hangout_events" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "hangout_events" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "hangout_events" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "hangout_events" DROP CONSTRAINT "PK_c8ba153b2cb1d4c7f15e90df57c"`);
        await queryRunner.query(`ALTER TABLE "hangout_events" ADD CONSTRAINT "PK_21a1f873a47a8d173b71037e637" PRIMARY KEY ("event_id")`);
        await queryRunner.query(`ALTER TABLE "hangout_events" DROP COLUMN "id"`);
    }

}
