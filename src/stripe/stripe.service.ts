import { Inject, Injectable } from '@nestjs/common';
import { stripeConfig } from '../config/stripe.config';
import type { ConfigType } from '@nestjs/config';
import Stripe from 'stripe';

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

  get client(): Stripe {
    return this.stripe;
  }
}
