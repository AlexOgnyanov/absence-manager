import { MigrationInterface, QueryRunner } from "typeorm";

export class Company1708954670053 implements MigrationInterface {
    name = 'Company1708954670053'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "company" DROP COLUMN "yearlyAbsenceCount"`);
        await queryRunner.query(`ALTER TABLE "absence_amount" DROP CONSTRAINT "FK_50ba6ffdf9c5f3ebed2e80e5275"`);
        await queryRunner.query(`ALTER TABLE "absence_amount" DROP CONSTRAINT "FK_f07b1bfa7644241cadcd09e7309"`);
        await queryRunner.query(`ALTER TABLE "absence_amount" ALTER COLUMN "absenceTypeId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "absence_amount" ALTER COLUMN "userId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "absence_amount" ADD CONSTRAINT "FK_50ba6ffdf9c5f3ebed2e80e5275" FOREIGN KEY ("absenceTypeId") REFERENCES "absence_type"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "absence_amount" ADD CONSTRAINT "FK_f07b1bfa7644241cadcd09e7309" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "absence_amount" DROP CONSTRAINT "FK_f07b1bfa7644241cadcd09e7309"`);
        await queryRunner.query(`ALTER TABLE "absence_amount" DROP CONSTRAINT "FK_50ba6ffdf9c5f3ebed2e80e5275"`);
        await queryRunner.query(`ALTER TABLE "absence_amount" ALTER COLUMN "userId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "absence_amount" ALTER COLUMN "absenceTypeId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "absence_amount" ADD CONSTRAINT "FK_f07b1bfa7644241cadcd09e7309" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "absence_amount" ADD CONSTRAINT "FK_50ba6ffdf9c5f3ebed2e80e5275" FOREIGN KEY ("absenceTypeId") REFERENCES "absence_type"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "company" ADD "yearlyAbsenceCount" integer NOT NULL`);
    }

}
