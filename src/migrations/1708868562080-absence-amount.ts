import { MigrationInterface, QueryRunner } from "typeorm";

export class AbsenceAmount1708868562080 implements MigrationInterface {
    name = 'AbsenceAmount1708868562080'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "absence_amount" ("id" SERIAL NOT NULL, "amount" integer, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "absenceTypeId" integer, "userId" uuid, CONSTRAINT "PK_9d697693b5eab7fc87a90d757cb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "absence_amount" ADD CONSTRAINT "FK_50ba6ffdf9c5f3ebed2e80e5275" FOREIGN KEY ("absenceTypeId") REFERENCES "absence_type"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "absence_amount" ADD CONSTRAINT "FK_f07b1bfa7644241cadcd09e7309" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "absence_amount" DROP CONSTRAINT "FK_f07b1bfa7644241cadcd09e7309"`);
        await queryRunner.query(`ALTER TABLE "absence_amount" DROP CONSTRAINT "FK_50ba6ffdf9c5f3ebed2e80e5275"`);
        await queryRunner.query(`DROP TABLE "absence_amount"`);
    }

}
