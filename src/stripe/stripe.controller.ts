import { Body, Controller, Get, Post } from '@nestjs/common';
import { PingDto } from './dtos/ping.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { CreateCheckoutSessionDto } from './dtos/create-checkout-session.dto';
import { StripeService } from './stripe.service';

@ApiTags('stripe')
@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Post('ping')
  @ApiOperation({ summary: 'Ping endpoint' })
  @ApiResponse({ status: 200, description: 'OK' })
  @ApiBody({ type: PingDto })
  ping(@Body() dto: PingDto) {
    return { ok: true, email: dto.email };
  }

  @Post('checkout-session-dry')
  checkoutSessionDry(@Body() dto: CreateCheckoutSessionDto) {
    return {
      ok: true,
      dto,
      quantityType: typeof dto.quantity,
    };
  }

  @Get('health')
  async health() {
    const account = await this.stripeService.client.accounts.retrieve();
    return { ok: true, accountId: account.id };
  }
}
