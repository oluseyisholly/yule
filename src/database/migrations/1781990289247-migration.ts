import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1781990289247 implements MigrationInterface {
    name = 'Migration1781990289247'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_contacts_user_id_unique" ON "contacts" ("user_id") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_contacts_email_unique" ON "contacts" ("email") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_contacts_email_unique"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_contacts_user_id_unique"`);
    }

}
