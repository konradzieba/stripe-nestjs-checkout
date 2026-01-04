import { registerAs } from '@nestjs/config';
import { z } from 'zod';
import Stripe from 'stripe';
import { parseStripeApiVersion } from './stripe-api-version';

const stripeConfigSchema = z.object({
  secretKey: z.string().min(1, 'STRIPE_SECRET_KEY is required'),
  webhookSecret: z.string().min(1, 'STRIPE_WEBHOOK_SECRET is required'),
  apiVersion: z
    .string()
    .regex(
      /^\d{4}-\d{2}-\d{2}(\.[a-z0-9_-]+)?$/i,
      'STRIPE_API_VERSION must be YYYY-MM-DD or YYYY-MM-DD.<release>',
    )
    .optional(),
  appUrl: z.url().optional(),
});

export interface StripeConfig {
  secretKey: string;
  webhookSecret: string;
  apiVersion?: Stripe.LatestApiVersion;
  appUrl?: string;
}

export const stripeConfig = registerAs('stripe', (): StripeConfig => {
  const parsed = stripeConfigSchema.parse({
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    apiVersion: process.env.STRIPE_API_VERSION,
    appUrl: process.env.APP_URL,
  });

  return {
    ...parsed,
    apiVersion: parseStripeApiVersion(parsed.apiVersion),
  };
});
