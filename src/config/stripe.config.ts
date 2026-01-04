import { registerAs } from '@nestjs/config';
import { z } from 'zod';

const stripeConfigSchema = z.object({
  secretKey: z.string().min(1),
  webhookSecret: z.string().min(1).optional(),
  apiVersion: z.string().min(1).optional(),
  appUrl: z.url().optional(),
});

export type StripeConfig = z.infer<typeof stripeConfigSchema>;

export const stripeConfig = registerAs('stripe', (): StripeConfig => {
  const cfg = {
    secretKey: process.env.STRIPE_SECRET_KEY ?? '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    apiVersion: process.env.STRIPE_API_VERSION,
    appUrl: process.env.APP_URL,
  };

  // Validation on namespace level
  return stripeConfigSchema.parse(cfg);
});
