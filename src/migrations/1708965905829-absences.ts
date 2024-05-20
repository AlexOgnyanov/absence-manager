import { MigrationInterface, QueryRunner } from "typeorm";

export class Absences1708965905829 implements MigrationInterface {
    name = 'Absences1708965905829'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."absence_status_enum" AS ENUM('requested', 'approved', 'rejected')`);
        await queryRunner.query(`CREATE TABLE "absence" ("id" SERIAL NOT NULL, "startDate" TIMESTAMP WITH TIME ZONE NOT NULL, "endDate" TIMESTAMP WITH TIME ZONE NOT NULL, "count" integer NOT NULL, "status" "public"."absence_status_enum" NOT NULL, "note" character varying, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "userId" uuid, "absenceTypeId" integer, "replacementUserId" uuid, CONSTRAINT "PK_30089b15c0f880f026581218c16" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "absence" ADD CONSTRAINT "FK_a2cd12ac708c89421eb6fd91ff5" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "absence" ADD CONSTRAINT "FK_968406768f40e391aac0a9ada8a" FOREIGN KEY ("absenceTypeId") REFERENCES "absence_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "absence" ADD CONSTRAINT "FK_d2939c50a1ad731cc816890ddc7" FOREIGN KEY ("replacementUserId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "absence" DROP CONSTRAINT "FK_d2939c50a1ad731cc816890ddc7"`);
        await queryRunner.query(`ALTER TABLE "absence" DROP CONSTRAINT "FK_968406768f40e391aac0a9ada8a"`);
        await queryRunner.query(`ALTER TABLE "absence" DROP CONSTRAINT "FK_a2cd12ac708c89421eb6fd91ff5"`);
        await queryRunner.query(`DROP TABLE "absence"`);
        await queryRunner.query(`DROP TYPE "public"."absence_status_enum"`);
    }

}
