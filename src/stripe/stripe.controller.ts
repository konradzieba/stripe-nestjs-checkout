import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  Logger,
  Post,
  Req,
} from '@nestjs/common';
import { StripeService } from './stripe.service';
import { PingDto } from './dtos/ping.dto';
import { CreateCheckoutSessionDto } from './dtos/create-checkout-session.dto';
import { StripeApi } from './stripe.swagger';
import Stripe from 'stripe';
import type { Request } from 'express';

type RawBodyRequest<T> = T & { rawBody?: Buffer };

@StripeApi.Tag()
@Controller('stripe')
export class StripeController {
  private readonly logContext = StripeController.name;

  constructor(
    private readonly stripeService: StripeService,
    private readonly logger: Logger,
  ) {}

  @Post('ping')
  @StripeApi.Ping()
  ping(@Body() dto: PingDto) {
    this.logger.log(`Ping called for email=${dto.email}`, this.logContext);
    return { ok: true, email: dto.email };
  }

  @Post('checkout-session-dry')
  @StripeApi.CheckoutSessionDry()
  checkoutSessionDry(@Body() dto: CreateCheckoutSessionDto) {
    this.logger.log(
      `Checkout dry-run price=${dto.priceId}, qty=${dto.quantity ?? 'n/a'}, email=${dto.customerEmail ?? 'n/a'}`,
      this.logContext,
    );
    return { ok: true, dto, quantityType: typeof dto.quantity };
  }

  @Get('health')
  @StripeApi.Health()
  async health() {
    this.logger.log('Health check requested', this.logContext);
    const account = await this.stripeService.client.accounts.retrieve();
    this.logger.log(`Health check OK accountId=${account.id}`, this.logContext);
    return { ok: true, accountId: account.id };
  }

  @Post('checkout-session')
  @StripeApi.CheckoutSession()
  async checkoutSession(@Body() dto: CreateCheckoutSessionDto) {
    const quantity = dto.quantity ?? 1;
    this.logger.log(
      `Creating checkout session price=${dto.priceId}, qty=${quantity}, email=${dto.customerEmail ?? 'n/a'}`,
      this.logContext,
    );
    const session = await this.stripeService.createCheckoutSession({
      priceId: dto.priceId,
      quantity,
      customerEmail: dto.customerEmail,
      metadata: {
        source: 'nestjs',
      },
    });

    this.logger.log(
      `Checkout session created id=${session.id}`,
      this.logContext,
    );

    return {
      id: session.id,
      url: session.url,
    };
  }

  @Post('webhook')
  webhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature?: string,
  ) {
    if (!signature) {
      this.logger.warn(
        'Webhook rejected: missing stripe-signature',
        this.logContext,
      );
      throw new BadRequestException('Missing stripe-signature header');
    }

    const rawBody = req.rawBody;
    if (!rawBody) {
      this.logger.warn('Webhook rejected: missing rawBody', this.logContext);
      throw new BadRequestException('Missing rawBody on request');
    }

    let event: Stripe.Event;
    try {
      event = this.stripeService.constructWebhookEvent(signature, rawBody);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Invalid signature';
      this.logger.warn(
        `Webhook signature verification failed: ${message}`,
        this.logContext,
      );
      throw new BadRequestException(message);
    }

    this.logger.log(`Webhook received type=${event.type}`, this.logContext);
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        this.logger.log(
          `Checkout session completed id=${session.id}`,
          this.logContext,
        );
        return { received: true, type: event.type, sessionId: session.id };
      }
      default:
        this.logger.log(
          `Webhook forwarded type=${event.type}`,
          this.logContext,
        );
        return { received: true, type: event.type };
    }
  }
}
