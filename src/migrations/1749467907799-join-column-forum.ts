import { MigrationInterface, QueryRunner } from "typeorm";

export class JoinColumnForum1749467907799 implements MigrationInterface {
    name = 'JoinColumnForum1749467907799'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "forum_post" DROP CONSTRAINT "FK_25a59022a9c95eb1016ad24e775"`);
        await queryRunner.query(`ALTER TABLE "forum_post" DROP COLUMN "authorId"`);
        await queryRunner.query(`ALTER TABLE "forum_post" ADD CONSTRAINT "FK_b35873d317eb82b8c3601112010" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "forum_post" DROP CONSTRAINT "FK_b35873d317eb82b8c3601112010"`);
        await queryRunner.query(`ALTER TABLE "forum_post" ADD "authorId" integer`);
        await queryRunner.query(`ALTER TABLE "forum_post" ADD CONSTRAINT "FK_25a59022a9c95eb1016ad24e775" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
