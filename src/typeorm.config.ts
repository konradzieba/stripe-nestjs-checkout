import 'dotenv/config';
import { DataSource } from 'typeorm';
import { join } from 'path';

const dbSync = process.env.DB_SYNC === 'true';
const hasUrl = Boolean(process.env.DATABASE_URL);

const common = {
  type: 'postgres' as const,
  entities: [join(__dirname, '/**/*.entity.{ts,js}')],
  migrations: [join(__dirname, '/migrations/*.{ts,js}')],
  synchronize: dbSync,
  migrationsRun: !dbSync,
};

const dataSource = new DataSource(
  hasUrl
    ? {
        ...common,
        url: process.env.DATABASE_URL!,
      }
    : {
        ...common,
        host: process.env.DB_HOST,
        port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
      },
);

export default dataSource;
