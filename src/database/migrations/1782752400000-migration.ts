import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1782752400000 implements MigrationInterface {
  name = 'Migration1782752400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "contacts" ADD COLUMN IF NOT EXISTS "profile_url" text`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "contacts" DROP COLUMN IF EXISTS "profile_url"`,
    );
  }
}
