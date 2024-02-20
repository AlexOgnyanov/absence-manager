import { MigrationInterface, QueryRunner } from "typeorm";

export class Session1708266512061 implements MigrationInterface {
    name = 'Session1708266512061'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "department_users_user" DROP CONSTRAINT "FK_970d4efc2e5ca66700c27d43d62"`);
        await queryRunner.query(`CREATE TABLE "session" ("id" character varying NOT NULL, "refreshToken" character varying NOT NULL, "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL, "userId" uuid, CONSTRAINT "PK_f55da76ac1c3ac420f444d2ff11" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "session" ADD CONSTRAINT "FK_3d2f174ef04fb312fdebd0ddc53" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "department_users_user" ADD CONSTRAINT "FK_970d4efc2e5ca66700c27d43d62" FOREIGN KEY ("departmentId") REFERENCES "department"("id") ON DELETE NO ACTION ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "department_users_user" DROP CONSTRAINT "FK_970d4efc2e5ca66700c27d43d62"`);
        await queryRunner.query(`ALTER TABLE "session" DROP CONSTRAINT "FK_3d2f174ef04fb312fdebd0ddc53"`);
        await queryRunner.query(`DROP TABLE "session"`);
        await queryRunner.query(`ALTER TABLE "department_users_user" ADD CONSTRAINT "FK_970d4efc2e5ca66700c27d43d62" FOREIGN KEY ("departmentId") REFERENCES "department"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

}
