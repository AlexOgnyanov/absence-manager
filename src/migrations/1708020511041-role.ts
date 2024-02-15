import { MigrationInterface, QueryRunner } from "typeorm";

export class Role1708020511041 implements MigrationInterface {
    name = 'Role1708020511041'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "role" DROP CONSTRAINT "UQ_ae4578dcaed5adff96595e61660"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "role" ADD CONSTRAINT "UQ_ae4578dcaed5adff96595e61660" UNIQUE ("name")`);
    }

}
