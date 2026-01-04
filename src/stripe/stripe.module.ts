import { Logger, Module } from '@nestjs/common';
import { StripeController } from './stripe.controller';
import { StripeService } from './stripe.service';
import { OrdersModule } from '../orders/orders.module';

@Module({
  imports: [OrdersModule],
  controllers: [StripeController],
  providers: [StripeService, Logger],
})
export class StripeModule {}
