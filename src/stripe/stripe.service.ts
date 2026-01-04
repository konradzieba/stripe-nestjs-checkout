import { Inject, Injectable } from '@nestjs/common';
import { stripeConfig } from '../config/stripe.config';
import type { ConfigType } from '@nestjs/config';
import Stripe from 'stripe';
import { CreateCheckoutSessionParam } from './params/create-checkout-session.param';

@Injectable()
export class StripeService {
  private readonly stripe: Stripe;

  constructor(
    @Inject(stripeConfig.KEY)
    private readonly config: ConfigType<typeof stripeConfig>,
  ) {
    this.stripe = new Stripe(this.config.secretKey, {
      ...(this.config.apiVersion ? { apiVersion: this.config.apiVersion } : {}),
    });
  }

  constructWebhookEvent(signature: string, payload: Buffer) {
    return this.client.webhooks.constructEvent(
      payload,
      signature,
      this.config.webhookSecret,
    );
  }

  get client(): Stripe {
    return this.stripe;
  }

  async createCheckoutSession(params: CreateCheckoutSessionParam) {
    const session = await this.client.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price: params.priceId, quantity: params.quantity }],
      success_url: `${this.config.appUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${this.config.appUrl}/cancel`,
      customer_email: params.customerEmail,
      metadata: params.metadata,
      payment_method_types: ['card', 'p24', 'blik'],
    });

    return session;
  }
}
