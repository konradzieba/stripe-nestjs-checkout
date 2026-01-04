import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConsumes,
  ApiExtraModels,
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { PingDto } from './dtos/ping.dto';
import { CreateCheckoutSessionDto } from './dtos/create-checkout-session.dto';
import { CheckoutSessionResponseDto } from './dtos/checkout-session-response.dto';
import { StripeWebhookResponseDto } from './dtos/webhook.response.dto';

class ErrorResponseDto {
  statusCode!: number;
  message!: string | string[];
  error?: string;
}

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
      ApiBadRequestResponse({
        type: ErrorResponseDto,
        schema: {
          example: {
            statusCode: 400,
            message: "No such price: 'price_XXX'",
            error: 'Bad Request',
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

  CheckoutSession: () =>
    applyDecorators(
      ApiExtraModels(CheckoutSessionResponseDto),
      ApiOperation({ summary: 'Create Stripe Checkout Session' }),
      ApiBody({ type: CreateCheckoutSessionDto }),
      ApiOkResponse({
        type: CheckoutSessionResponseDto,
        schema: {
          example: {
            id: 'cs_test_123',
            url: 'https://checkout.stripe.com/c/pay_123',
          },
        },
      }),
      ApiBadRequestResponse({
        type: ErrorResponseDto,
        schema: {
          example: {
            statusCode: 400,
            message: "No such price: 'price_XXX'",
            error: 'Bad Request',
          },
        },
      }),
    ),

  Webhook: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Stripe webhook endpoint',
        description:
          'Receives Stripe events. Requires raw body and Stripe-Signature header for verification.',
      }),
      ApiConsumes('application/json'),
      ApiHeader({
        name: 'stripe-signature',
        required: true,
        description: 'Stripe webhook signature header',
      }),
      ApiBody({
        schema: {
          type: 'object',
          additionalProperties: true,
          example: { id: 'evt_123', type: 'checkout.session.completed' },
        },
      }),
      ApiOkResponse({
        type: StripeWebhookResponseDto,
        schema: {
          example: { received: true, type: 'checkout.session.completed' },
        },
      }),
    ),
} as const;
