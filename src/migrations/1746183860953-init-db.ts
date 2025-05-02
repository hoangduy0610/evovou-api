import { MigrationInterface, QueryRunner } from "typeorm";

export class InitDb1746183860953 implements MigrationInterface {
    name = 'InitDb1746183860953'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."vendor_user_role_enum" AS ENUM('ROLE_ADMIN', 'ROLE_USER')`);
        await queryRunner.query(`CREATE TABLE "vendor_user" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "password" character varying NOT NULL, "role" "public"."vendor_user_role_enum" NOT NULL DEFAULT 'ROLE_USER', "name" character varying NOT NULL, "avatar" character varying, "email" character varying NOT NULL, "vendorId" integer NOT NULL, CONSTRAINT "UQ_6136b777aa121756218fa70ee7b" UNIQUE ("email"), CONSTRAINT "PK_139dbded1008da1588c16f34a40" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "vendor_voucher_denomination" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "value" integer NOT NULL, "name" character varying NOT NULL, "vendorId" integer NOT NULL, CONSTRAINT "PK_245a403765abba58e08c9d49406" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "vendor" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "name" character varying NOT NULL, "description" character varying NOT NULL, "logo" character varying NOT NULL, "website" character varying NOT NULL, "email" character varying NOT NULL, "phone" character varying NOT NULL, "address" character varying NOT NULL, "howToUse" character varying NOT NULL, CONSTRAINT "PK_931a23f6231a57604f5a0e32780" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."vendor_voucher_status_enum" AS ENUM('READY', 'REDEEMED', 'EXPIRED', 'CANCELLED')`);
        await queryRunner.query(`CREATE TABLE "vendor_voucher" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "denominationId" integer NOT NULL, "ownerId" integer NOT NULL, "status" "public"."vendor_voucher_status_enum" NOT NULL DEFAULT 'READY', "expiredAt" TIMESTAMP, "redeemedAt" TIMESTAMP, "vendorId" integer NOT NULL, "code" character varying NOT NULL, CONSTRAINT "PK_cca7a4ee459cd6e7ca81329caaa" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."user_role_enum" AS ENUM('ROLE_ADMIN', 'ROLE_USER')`);
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "password" character varying NOT NULL, "role" "public"."user_role_enum" NOT NULL DEFAULT 'ROLE_USER', "name" character varying NOT NULL, "avatar" character varying, "email" character varying NOT NULL, "walletAddress" character varying NOT NULL, "balance" integer NOT NULL DEFAULT '0', CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "UQ_efbd1135797e451d834bcf88cd2" UNIQUE ("walletAddress"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."voucher_status_enum" AS ENUM('READY', 'REDEEMED', 'EXPIRED', 'CANCELLED')`);
        await queryRunner.query(`CREATE TABLE "voucher" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "denominationId" integer NOT NULL, "ownerId" integer NOT NULL, "status" "public"."voucher_status_enum" NOT NULL DEFAULT 'READY', "expiredAt" TIMESTAMP, "redeemedAt" TIMESTAMP, "tokenId" integer NOT NULL, CONSTRAINT "PK_677ae75f380e81c2f103a57ffaf" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "voucher_denomination" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "value" integer NOT NULL, "name" character varying NOT NULL, CONSTRAINT "PK_f42265401acecdf6c0f9f1391ef" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "vendor_user" ADD CONSTRAINT "FK_58b037f882dcc36ee8bdbf75a8b" FOREIGN KEY ("vendorId") REFERENCES "vendor"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "vendor_voucher_denomination" ADD CONSTRAINT "FK_4ad44840d765a47d18bd06cc85e" FOREIGN KEY ("vendorId") REFERENCES "vendor"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "vendor_voucher" ADD CONSTRAINT "FK_1e49bc3869417e88902e8ce8f45" FOREIGN KEY ("denominationId") REFERENCES "vendor_voucher_denomination"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "vendor_voucher" ADD CONSTRAINT "FK_07fa4dc112649d8cc3c8d86c7a7" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "vendor_voucher" ADD CONSTRAINT "FK_e69ab92c0d9f401ba2cf5b1d132" FOREIGN KEY ("vendorId") REFERENCES "vendor"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "voucher" ADD CONSTRAINT "FK_fc901de87d8a6b6c7b845534880" FOREIGN KEY ("denominationId") REFERENCES "voucher_denomination"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "voucher" ADD CONSTRAINT "FK_44fb18d8837f86f14cd7597544c" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "voucher" DROP CONSTRAINT "FK_44fb18d8837f86f14cd7597544c"`);
        await queryRunner.query(`ALTER TABLE "voucher" DROP CONSTRAINT "FK_fc901de87d8a6b6c7b845534880"`);
        await queryRunner.query(`ALTER TABLE "vendor_voucher" DROP CONSTRAINT "FK_e69ab92c0d9f401ba2cf5b1d132"`);
        await queryRunner.query(`ALTER TABLE "vendor_voucher" DROP CONSTRAINT "FK_07fa4dc112649d8cc3c8d86c7a7"`);
        await queryRunner.query(`ALTER TABLE "vendor_voucher" DROP CONSTRAINT "FK_1e49bc3869417e88902e8ce8f45"`);
        await queryRunner.query(`ALTER TABLE "vendor_voucher_denomination" DROP CONSTRAINT "FK_4ad44840d765a47d18bd06cc85e"`);
        await queryRunner.query(`ALTER TABLE "vendor_user" DROP CONSTRAINT "FK_58b037f882dcc36ee8bdbf75a8b"`);
        await queryRunner.query(`DROP TABLE "voucher_denomination"`);
        await queryRunner.query(`DROP TABLE "voucher"`);
        await queryRunner.query(`DROP TYPE "public"."voucher_status_enum"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TYPE "public"."user_role_enum"`);
        await queryRunner.query(`DROP TABLE "vendor_voucher"`);
        await queryRunner.query(`DROP TYPE "public"."vendor_voucher_status_enum"`);
        await queryRunner.query(`DROP TABLE "vendor"`);
        await queryRunner.query(`DROP TABLE "vendor_voucher_denomination"`);
        await queryRunner.query(`DROP TABLE "vendor_user"`);
        await queryRunner.query(`DROP TYPE "public"."vendor_user_role_enum"`);
    }

}
