import { MigrationInterface, QueryRunner } from "typeorm";

export class TokenCreationDate1708005599643 implements MigrationInterface {
    name = 'TokenCreationDate1708005599643'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "password_change_token" ADD "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "password_reset_token" ADD "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "password_reset_token" DROP COLUMN "createdAt"`);
        await queryRunner.query(`ALTER TABLE "password_change_token" DROP COLUMN "createdAt"`);
    }

}
