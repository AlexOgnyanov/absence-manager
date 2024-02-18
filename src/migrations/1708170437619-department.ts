import { MigrationInterface, QueryRunner } from "typeorm";

export class Department1708170437619 implements MigrationInterface {
    name = 'Department1708170437619'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "department" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "companyId" integer, CONSTRAINT "PK_9a2213262c1593bffb581e382f5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "department_users_user" ("departmentId" integer NOT NULL, "userId" uuid NOT NULL, CONSTRAINT "PK_68cdf6a6176691de6f780798bbc" PRIMARY KEY ("departmentId", "userId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_970d4efc2e5ca66700c27d43d6" ON "department_users_user" ("departmentId") `);
        await queryRunner.query(`CREATE INDEX "IDX_3a52d2ac1dc3a9812f6301b4b5" ON "department_users_user" ("userId") `);
        await queryRunner.query(`ALTER TABLE "department" ADD CONSTRAINT "FK_1c9f0159b4ae69008bd356bb1ce" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "department_users_user" ADD CONSTRAINT "FK_970d4efc2e5ca66700c27d43d62" FOREIGN KEY ("departmentId") REFERENCES "department"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "department_users_user" ADD CONSTRAINT "FK_3a52d2ac1dc3a9812f6301b4b5c" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "department_users_user" DROP CONSTRAINT "FK_3a52d2ac1dc3a9812f6301b4b5c"`);
        await queryRunner.query(`ALTER TABLE "department_users_user" DROP CONSTRAINT "FK_970d4efc2e5ca66700c27d43d62"`);
        await queryRunner.query(`ALTER TABLE "department" DROP CONSTRAINT "FK_1c9f0159b4ae69008bd356bb1ce"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_3a52d2ac1dc3a9812f6301b4b5"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_970d4efc2e5ca66700c27d43d6"`);
        await queryRunner.query(`DROP TABLE "department_users_user"`);
        await queryRunner.query(`DROP TABLE "department"`);
    }

}
