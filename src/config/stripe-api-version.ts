import Stripe from 'stripe';

export function parseStripeApiVersion(
  value: string | undefined,
): Stripe.LatestApiVersion | undefined {
  if (!value) return undefined;

  const ok = /^\d{4}-\d{2}-\d{2}(\.[a-z0-9_-]+)?$/i.test(value);
  if (!ok) {
    throw new Error(
      `Invalid STRIPE_API_VERSION format: "${value}". Expected YYYY-MM-DD or YYYY-MM-DD.<release>`,
    );
  }

  return value as unknown as Stripe.LatestApiVersion;
}
