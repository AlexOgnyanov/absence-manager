import { MigrationInterface, QueryRunner } from "typeorm";

export class VerificationTokens1707923763427 implements MigrationInterface {
    name = 'VerificationTokens1707923763427'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "email_confirmation_token" ("id" SERIAL NOT NULL, "token" character varying NOT NULL, "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL, "userId" uuid, CONSTRAINT "PK_2fa8d5586af7e96201b84492131" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "password_change_token" ("id" SERIAL NOT NULL, "token" character varying NOT NULL, "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL, "userId" uuid, CONSTRAINT "PK_4fa6f50f1eb403d84e94c2abf31" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "password_reset_token" ("id" SERIAL NOT NULL, "token" character varying NOT NULL, "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL, "userId" uuid, CONSTRAINT "PK_838af121380dfe3a6330e04f5bb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "email_confirmation_token" ADD CONSTRAINT "FK_7feea0fcbc4dc7949bcdea9939f" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "password_change_token" ADD CONSTRAINT "FK_2128a13a2f4a49e1d8b1c2456af" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "password_reset_token" ADD CONSTRAINT "FK_a4e53583f7a8ab7d01cded46a41" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "password_reset_token" DROP CONSTRAINT "FK_a4e53583f7a8ab7d01cded46a41"`);
        await queryRunner.query(`ALTER TABLE "password_change_token" DROP CONSTRAINT "FK_2128a13a2f4a49e1d8b1c2456af"`);
        await queryRunner.query(`ALTER TABLE "email_confirmation_token" DROP CONSTRAINT "FK_7feea0fcbc4dc7949bcdea9939f"`);
        await queryRunner.query(`DROP TABLE "password_reset_token"`);
        await queryRunner.query(`DROP TABLE "password_change_token"`);
        await queryRunner.query(`DROP TABLE "email_confirmation_token"`);
    }

}
