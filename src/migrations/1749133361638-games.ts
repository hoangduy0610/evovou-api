import { MigrationInterface, QueryRunner } from "typeorm";

export class Games1749133361638 implements MigrationInterface {
    name = 'Games1749133361638'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "lastUsedWheelOfFortune" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "user" ADD "lastUsedBlindBox" TIMESTAMP NOT NULL DEFAULT now()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "lastUsedBlindBox"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "lastUsedWheelOfFortune"`);
    }

}
