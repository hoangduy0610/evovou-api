import { MigrationInterface, QueryRunner } from "typeorm";

export class VnpayUpdate1749214470479 implements MigrationInterface {
    name = 'VnpayUpdate1749214470479'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order" ADD "expiresAt" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "order" ADD "paymentUrl" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "paymentUrl"`);
        await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "expiresAt"`);
    }

}
