import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private readonly stripe: Stripe;

  constructor(private readonly config: ConfigService) {
    const secretKey = this.config.get<string>('STRIPE_SECRET_KEY');
    if (!secretKey) {
      throw new Error('Missing STRIPE_SECRET_KEY in .env');
    }

    this.stripe = new Stripe(secretKey, {
      apiVersion: '2025-12-15.clover',
    });
  }

  get client(): Stripe {
    return this.stripe;
  }
}
