import { registerAs } from "@nestjs/config";
import { config as dotenvConfig } from 'dotenv';
import { DataSource, DataSourceOptions } from "typeorm";
import { envFiles } from "./Constant";

dotenvConfig({ path: envFiles });

const config = {
    type: 'postgres',
    host: `${process.env.DATABASE_HOST}`,
    port: `${process.env.DATABASE_PORT}`,
    username: `${process.env.DATABASE_USERNAME}`,
    password: `${process.env.DATABASE_PASSWORD}`,
    database: `${process.env.DATABASE_NAME}`,
    entities: ["dist/entities/schema/*.entity{.ts,.js}"],
    migrations: ["dist/migrations/*{.ts,.js}"],
    autoLoadEntities: true,
    synchronize: false,
    logging: false, // Disable logging
    subscribers: [],
    schema: "public",
    migrationsRun: true,
}

export default registerAs('typeorm', () => config)
export const connectionSource = new DataSource(config as DataSourceOptions);