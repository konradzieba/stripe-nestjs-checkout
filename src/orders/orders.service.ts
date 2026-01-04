import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './order.entity';
import { orderStatuses } from './order-status';
import { stripeConfig } from '../stripe/../config/stripe.config';
import type { StripeConfig } from '../stripe/../config/stripe.config';

@Injectable()
export class OrdersService {
  constructor(
    @Inject(stripeConfig.KEY)
    private readonly config: StripeConfig,
    @InjectRepository(Order) private readonly repo: Repository<Order>,
  ) {}

  async createPending(input: {
    priceId: string;
    quantity: number;
    customerEmail?: string;
  }) {
    if (!this.config.allowedPriceIds.includes(input.priceId)) {
      throw new BadRequestException('Unsupported priceId');
    }
    const order = this.repo.create({
      status: orderStatuses.PENDING,
      priceId: input.priceId,
      quantity: input.quantity,
      customerEmail: input.customerEmail ?? null,
      stripeSessionId: null,
      stripePaymentIntentId: null,
      stripeEventId: null,
    });
    return this.repo.save(order);
  }

  async attachStripeSession(orderId: string, stripeSessionId: string) {
    await this.repo.update({ id: orderId }, { stripeSessionId });
  }

  async markPaidByOrderId(
    orderId: string,
    stripePaymentIntentId: string | null,
  ) {
    await this.repo.update(
      { id: orderId },
      { status: orderStatuses.PAID, stripePaymentIntentId },
    );
  }

  async markFailed(orderId: string) {
    await this.repo.update({ id: orderId }, { status: orderStatuses.FAILED });
  }

  async setStripeEventId(orderId: string, eventId: string) {
    await this.repo.update({ id: orderId }, { stripeEventId: eventId });
  }

  async findById(orderId: string) {
    return this.repo.findOneBy({ id: orderId });
  }

  async existsByStripeEventId(eventId: string) {
    const count = await this.repo.count({ where: { stripeEventId: eventId } });
    return count > 0;
  }
}
