## Stripe Nest Tutorial

NestJS + Stripe Checkout + webhooks + Postgres (TypeORM). Includes endpoints to create Checkout sessions, handle webhooks, and a simple orders model.

### Stack

- NestJS 11, TypeORM (Postgres)
- Stripe SDK
- Zod + class-validator
- Jest / Supertest
- Husky (pre-commit: format + lint, pre-push: lint + test)

## Requirements

- Node.js 18+
- pnpm
- Postgres
- Stripe keys (secret key, webhook secret, price IDs)

## Environment

Example `.env`:

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_ALLOWED_PRICE_IDS=price_123,price_456
APP_URL=http://localhost:2345

DATABASE_URL=postgres://user:pass@localhost:5432/stripe_db
DB_SYNC=false
```

Key vars: `APP_URL` (success/cancel redirects), `STRIPE_WEBHOOK_SECRET`, `STRIPE_ALLOWED_PRICE_IDS`, `DB_SYNC` (false in prod, true only locally if you want synchronize instead of migrations).

## Install

```bash
pnpm install
```

## Run

```bash
# dev (watch)


# prod build + run
pnpm build && pnpm start:prod
```

Swagger: http://localhost:2345/api

## Migrations (TypeORM)

- CLI config: `src/typeorm.config.ts`
- Generate diff (use a clean DB, DB_SYNC=false):
  ```bash
  pnpm migration:generate src/migrations/Initial
  ```
- Empty migration for manual edits:
  ```bash
  pnpm migration:create src/migrations/Manual
  ```
- Run / revert:
  ```bash
  pnpm migration:run
  pnpm migration:revert
  ```

## Scripts

- `pnpm format` – Prettier
- `pnpm lint` – ESLint
- `pnpm test` – unit tests
- `pnpm test:e2e` – e2e tests
- `pnpm migration:*` – migrations (generate/run/revert/create)

## Git hooks (Husky)

- pre-commit: `pnpm format` -> `pnpm lint`
- pre-push: `pnpm lint` -> `pnpm test`

## Endpoints

- POST `/stripe/checkout-session` – creates a Stripe Checkout session (requires priceId, optional quantity, customerEmail). Returns `id` and redirect `url`.
- POST `/stripe/webhook` – receives Stripe events (requires raw body and `stripe-signature`). Idempotent via `stripeEventId`.
- GET `/stripe/health` – Stripe account ping.
- GET `/success` / `/cancel` – payment redirect stubs (JSON).

## Database

`Order` model stores status (PENDING/PAID/FAILED), priceId, quantity, email, and Stripe identifiers (session, payment_intent, event). A conditional unique index on `stripeEventId` keeps webhooks idempotent.

## Dev notes

- Raw body is enabled only on `/stripe/webhook`.
- In production keep `DB_SYNC=false` and run migrations in your pipeline before the app starts.
  Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).
