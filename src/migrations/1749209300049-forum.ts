import { MigrationInterface, QueryRunner } from "typeorm";

export class Forum1749209300049 implements MigrationInterface {
    name = 'Forum1749209300049'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "forum_post" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "content" character varying NOT NULL, "images" text array, "voucherId" integer, "userId" integer NOT NULL, "authorId" integer, CONSTRAINT "PK_35363fad61a4ba1fb0ba562b444" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "forum_interaction" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "postId" integer NOT NULL, "userId" integer NOT NULL, CONSTRAINT "PK_60cd53ecca60dc8d2f9caedc2f7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "forum_comment" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "postId" integer NOT NULL, "userId" integer NOT NULL, "content" character varying NOT NULL, CONSTRAINT "PK_546f92f6bc18ac7e38b22a7ee3a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "forum_post" ADD CONSTRAINT "FK_1f49afd925ea5fd513658b8a9f0" FOREIGN KEY ("voucherId") REFERENCES "voucher"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "forum_post" ADD CONSTRAINT "FK_25a59022a9c95eb1016ad24e775" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "forum_interaction" ADD CONSTRAINT "FK_8d61a376b52023a3d447295f556" FOREIGN KEY ("postId") REFERENCES "forum_post"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "forum_interaction" ADD CONSTRAINT "FK_6455af1e50b9d4cd70b3adf7f03" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "forum_comment" ADD CONSTRAINT "FK_e39f9fe7200a2327d92ebffd279" FOREIGN KEY ("postId") REFERENCES "forum_post"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "forum_comment" ADD CONSTRAINT "FK_732e640bac204520096a6901d5a" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "forum_comment" DROP CONSTRAINT "FK_732e640bac204520096a6901d5a"`);
        await queryRunner.query(`ALTER TABLE "forum_comment" DROP CONSTRAINT "FK_e39f9fe7200a2327d92ebffd279"`);
        await queryRunner.query(`ALTER TABLE "forum_interaction" DROP CONSTRAINT "FK_6455af1e50b9d4cd70b3adf7f03"`);
        await queryRunner.query(`ALTER TABLE "forum_interaction" DROP CONSTRAINT "FK_8d61a376b52023a3d447295f556"`);
        await queryRunner.query(`ALTER TABLE "forum_post" DROP CONSTRAINT "FK_25a59022a9c95eb1016ad24e775"`);
        await queryRunner.query(`ALTER TABLE "forum_post" DROP CONSTRAINT "FK_1f49afd925ea5fd513658b8a9f0"`);
        await queryRunner.query(`DROP TABLE "forum_comment"`);
        await queryRunner.query(`DROP TABLE "forum_interaction"`);
        await queryRunner.query(`DROP TABLE "forum_post"`);
    }

}
