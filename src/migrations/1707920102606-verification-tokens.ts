import { MigrationInterface, QueryRunner } from "typeorm";

export class VerificationTokens1707920102606 implements MigrationInterface {
    name = 'VerificationTokens1707920102606'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "email-confirmation-token" ("id" SERIAL NOT NULL, "token" character varying NOT NULL, "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL, "userId" uuid, CONSTRAINT "PK_e380d41eea8ad01023e570e46fd" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "password-change-token" ("id" SERIAL NOT NULL, "token" character varying NOT NULL, "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL, "userId" uuid, CONSTRAINT "PK_ba8ff6cda327e5646de175f542b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "password-reset-token" ("id" SERIAL NOT NULL, "token" character varying NOT NULL, "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL, "userId" uuid, CONSTRAINT "PK_9ee641940c81267510276ee2837" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "email-confirmation-token" ADD CONSTRAINT "FK_199f1a0b9c2cd1d1b5f7b112f8a" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "password-change-token" ADD CONSTRAINT "FK_e485a1ca7de1608acd06d6636c2" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "password-reset-token" ADD CONSTRAINT "FK_bd9f92893aa21fdf0f2fe24006c" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "password-reset-token" DROP CONSTRAINT "FK_bd9f92893aa21fdf0f2fe24006c"`);
        await queryRunner.query(`ALTER TABLE "password-change-token" DROP CONSTRAINT "FK_e485a1ca7de1608acd06d6636c2"`);
        await queryRunner.query(`ALTER TABLE "email-confirmation-token" DROP CONSTRAINT "FK_199f1a0b9c2cd1d1b5f7b112f8a"`);
        await queryRunner.query(`DROP TABLE "password-reset-token"`);
        await queryRunner.query(`DROP TABLE "password-change-token"`);
        await queryRunner.query(`DROP TABLE "email-confirmation-token"`);
    }

}
