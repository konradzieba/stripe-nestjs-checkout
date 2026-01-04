import { registerAs } from '@nestjs/config';
import { z } from 'zod';

const databaseConfigSchema = z
  .object({
    url: z.string().min(1).optional(),
    host: z.string().min(1).optional(),
    port: z.number().int().positive().optional(),
    user: z.string().min(1).optional(),
    password: z.string().min(1).optional(),
    name: z.string().min(1).optional(),
    sync: z.boolean().default(false),
  })
  .superRefine((db, ctx) => {
    const hasUrl = Boolean(db.url);
    const hasParams =
      Boolean(db.host) &&
      Boolean(db.port) &&
      Boolean(db.user) &&
      Boolean(db.password) &&
      Boolean(db.name);

    if (!hasUrl && !hasParams) {
      ctx.addIssue({
        code: 'custom',
        message:
          'Missing database config: set DATABASE_URL or provide DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME',
        path: ['url'],
      });
    }
  });

export type DatabaseConfig = z.infer<typeof databaseConfigSchema>;

export const databaseConfig = registerAs('database', (): DatabaseConfig => {
  const cfg = {
    url: process.env.DATABASE_URL,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    name: process.env.DB_NAME,
    sync: process.env.DB_SYNC === 'true',
  };

  return databaseConfigSchema.parse(cfg);
});
