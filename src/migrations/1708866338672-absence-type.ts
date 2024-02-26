import { MigrationInterface, QueryRunner } from "typeorm";

export class AbsenceType1708866338672 implements MigrationInterface {
    name = 'AbsenceType1708866338672'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "absence_type" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "yealyCount" integer, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "companyId" integer, CONSTRAINT "PK_d158dcb3470261bdcd9a981718f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "absence_type" ADD CONSTRAINT "FK_70d25e5cdaeed0072e9aec79fce" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "absence_type" DROP CONSTRAINT "FK_70d25e5cdaeed0072e9aec79fce"`);
        await queryRunner.query(`DROP TABLE "absence_type"`);
    }

}
