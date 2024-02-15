import { MigrationInterface, QueryRunner } from "typeorm";

export class EmailConfirmation1708004063069 implements MigrationInterface {
    name = 'EmailConfirmation1708004063069'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "email_confirmation_token" DROP COLUMN "expiresAt"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "email_confirmation_token" ADD "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL`);
    }

}
