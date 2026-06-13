import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1780594397326 implements MigrationInterface {
    name = 'Migration1780594397326'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "event_participants" DROP CONSTRAINT "FK_ce3f433e47fdd8f072964293c8d"`);
        await queryRunner.query(`ALTER TABLE "event_logs" DROP CONSTRAINT "FK_d7c34c2926f0b915848d4f8ce86"`);
        await queryRunner.query(`ALTER TABLE "event_logs" RENAME COLUMN "actor_user_id" TO "actor_contact_id"`);
        await queryRunner.query(`ALTER TABLE "event_participants" DROP COLUMN "user_id"`);
        await queryRunner.query(`ALTER TABLE "event_logs" ADD CONSTRAINT "FK_e01e5fb5ecae805095b858f6d0c" FOREIGN KEY ("actor_contact_id") REFERENCES "contacts"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "event_logs" DROP CONSTRAINT "FK_e01e5fb5ecae805095b858f6d0c"`);
        await queryRunner.query(`ALTER TABLE "event_participants" ADD "user_id" uuid`);
        await queryRunner.query(`ALTER TABLE "event_logs" RENAME COLUMN "actor_contact_id" TO "actor_user_id"`);
        await queryRunner.query(`ALTER TABLE "event_logs" ADD CONSTRAINT "FK_d7c34c2926f0b915848d4f8ce86" FOREIGN KEY ("actor_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "event_participants" ADD CONSTRAINT "FK_ce3f433e47fdd8f072964293c8d" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

}
