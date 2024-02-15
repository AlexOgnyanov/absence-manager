import { MigrationInterface, QueryRunner } from "typeorm";

export class User1708028472137 implements MigrationInterface {
    name = 'User1708028472137'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "email_confirmation_token" DROP CONSTRAINT "FK_7feea0fcbc4dc7949bcdea9939f"`);
        await queryRunner.query(`ALTER TABLE "password_change_token" DROP CONSTRAINT "FK_2128a13a2f4a49e1d8b1c2456af"`);
        await queryRunner.query(`ALTER TABLE "password_reset_token" DROP CONSTRAINT "FK_a4e53583f7a8ab7d01cded46a41"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_86586021a26d1180b0968f98502"`);
        await queryRunner.query(`ALTER TABLE "role" DROP CONSTRAINT "FK_6d29d31feb24503b868472091bc"`);
        await queryRunner.query(`ALTER TABLE "email_confirmation_token" ADD CONSTRAINT "FK_7feea0fcbc4dc7949bcdea9939f" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "password_change_token" ADD CONSTRAINT "FK_2128a13a2f4a49e1d8b1c2456af" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "password_reset_token" ADD CONSTRAINT "FK_a4e53583f7a8ab7d01cded46a41" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_86586021a26d1180b0968f98502" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "role" ADD CONSTRAINT "FK_6d29d31feb24503b868472091bc" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "role" DROP CONSTRAINT "FK_6d29d31feb24503b868472091bc"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_86586021a26d1180b0968f98502"`);
        await queryRunner.query(`ALTER TABLE "password_reset_token" DROP CONSTRAINT "FK_a4e53583f7a8ab7d01cded46a41"`);
        await queryRunner.query(`ALTER TABLE "password_change_token" DROP CONSTRAINT "FK_2128a13a2f4a49e1d8b1c2456af"`);
        await queryRunner.query(`ALTER TABLE "email_confirmation_token" DROP CONSTRAINT "FK_7feea0fcbc4dc7949bcdea9939f"`);
        await queryRunner.query(`ALTER TABLE "role" ADD CONSTRAINT "FK_6d29d31feb24503b868472091bc" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_86586021a26d1180b0968f98502" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "password_reset_token" ADD CONSTRAINT "FK_a4e53583f7a8ab7d01cded46a41" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "password_change_token" ADD CONSTRAINT "FK_2128a13a2f4a49e1d8b1c2456af" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "email_confirmation_token" ADD CONSTRAINT "FK_7feea0fcbc4dc7949bcdea9939f" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
