import { Body, Controller, Get, Post } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { PingDto } from './dtos/ping.dto';
import { CreateCheckoutSessionDto } from './dtos/create-checkout-session.dto';
import { StripeApi } from './stripe.swagger';

@StripeApi.Tag()
@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Post('ping')
  @StripeApi.Ping()
  ping(@Body() dto: PingDto) {
    return { ok: true, email: dto.email };
  }

  @Post('checkout-session-dry')
  @StripeApi.CheckoutSessionDry()
  checkoutSessionDry(@Body() dto: CreateCheckoutSessionDto) {
    return { ok: true, dto, quantityType: typeof dto.quantity };
  }

  @Get('health')
  @StripeApi.Health()
  async health() {
    const account = await this.stripeService.client.accounts.retrieve();
    return { ok: true, accountId: account.id };
  }
}
