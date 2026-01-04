import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './order.entity';
import { orderStatuses } from './order-status';
import { stripeConfig } from '../config/stripe.config';
import type { StripeConfig } from '../config/stripe.config';

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
    const res = await this.repo.update({ id: orderId }, { stripeSessionId });
    if (res.affected === 0) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }
  }

  async markPaidByOrderId(
    orderId: string,
    stripePaymentIntentId: string | null,
  ) {
    const res = await this.repo.update(
      { id: orderId },
      { status: orderStatuses.PAID, stripePaymentIntentId },
    );
    if (res.affected === 0) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }
  }

  async markFailed(orderId: string) {
    const res = await this.repo.update(
      { id: orderId },
      { status: orderStatuses.FAILED },
    );
    if (res.affected === 0) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }
  }

  async setStripeEventId(orderId: string, eventId: string) {
    const res = await this.repo.update(
      { id: orderId },
      { stripeEventId: eventId },
    );
    if (res.affected === 0) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }
  }

  async findById(orderId: string) {
    return this.repo.findOneBy({ id: orderId });
  }

  async existsByStripeEventId(eventId: string) {
    const count = await this.repo.count({ where: { stripeEventId: eventId } });
    return count > 0;
  }
}
