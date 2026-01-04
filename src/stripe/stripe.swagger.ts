import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { PingDto } from './dtos/ping.dto';
import { CreateCheckoutSessionDto } from './dtos/create-checkout-session.dto';

export class PingResponseDto {
  ok!: boolean;
  email!: string;
}

export class CheckoutSessionDryResponseDto {
  ok!: boolean;
  dto!: CreateCheckoutSessionDto;
  quantityType!: string;
}

export class StripeHealthResponseDto {
  ok!: boolean;
  accountId!: string;
}

export const StripeApi = {
  Tag: () => ApiTags('stripe'),

  Ping: () =>
    applyDecorators(
      ApiOperation({ summary: 'Ping endpoint' }),
      ApiBody({ type: PingDto }),
      ApiOkResponse({
        type: PingResponseDto,
        schema: {
          example: { ok: true, email: 'test@example.com' },
        },
      }),
    ),

  CheckoutSessionDry: () =>
    applyDecorators(
      ApiOperation({ summary: 'Checkout session dry-run' }),
      ApiBody({ type: CreateCheckoutSessionDto }),
      ApiOkResponse({
        type: CheckoutSessionDryResponseDto,
        schema: {
          example: {
            ok: true,
            dto: { priceId: 'price_123', quantity: 2 },
            quantityType: 'number',
          },
        },
      }),
    ),

  Health: () =>
    applyDecorators(
      ApiOperation({ summary: 'Stripe health check' }),
      ApiOkResponse({
        type: StripeHealthResponseDto,
        schema: {
          example: { ok: true, accountId: 'acct_123456789' },
        },
      }),
    ),
} as const;
