import { MigrationInterface, QueryRunner } from "typeorm";

export class UserAddColumnWalletAddress1744642627898 implements MigrationInterface {
    name = 'UserAddColumnWalletAddress1744642627898'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "walletAddress" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "UQ_efbd1135797e451d834bcf88cd2" UNIQUE ("walletAddress")`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email")`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "UQ_efbd1135797e451d834bcf88cd2"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "walletAddress"`);
    }

}
