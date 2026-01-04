import { z } from 'zod';

export const envSchema = z
  .object({
    NODE_ENV: z
      .enum(['development', 'test', 'production'])
      .default('development'),

    // Stripe
    STRIPE_SECRET_KEY: z.string().min(1),
    STRIPE_WEBHOOK_SECRET: z.string().min(1),
    STRIPE_API_VERSION: z.string().min(1).optional(),
    STRIPE_ALLOWED_PRICE_IDS: z.string().min(1),

    APP_URL: z.url(),

    // Database (PostgreSQL)
    DATABASE_URL: z.string().min(1).optional(),

    DB_HOST: z.string().min(1).optional(),
    DB_PORT: z.coerce.number().int().positive().optional(),
    DB_USER: z.string().min(1).optional(),
    DB_PASSWORD: z.string().min(1).optional(),
    DB_NAME: z.string().min(1).optional(),
    DB_SYNC: z.coerce.boolean().default(false),
  })
  .superRefine((env, ctx) => {
    const hasUrl = Boolean(env.DATABASE_URL);
    const hasParams =
      Boolean(env.DB_HOST) &&
      Boolean(env.DB_PORT) &&
      Boolean(env.DB_USER) &&
      Boolean(env.DB_PASSWORD) &&
      Boolean(env.DB_NAME);

    // DATABASE_URL or all other params must be set
    if (!hasUrl && !hasParams) {
      ctx.addIssue({
        code: 'custom',
        message:
          'Missing database config: set DATABASE_URL or provide DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME',
        path: ['DATABASE_URL'],
      });
    }
  });

export type Env = z.infer<typeof envSchema>;
