import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './order.entity';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([Order])],
  providers: [OrdersService],
  controllers: [OrdersController],
  exports: [OrdersService],
})
export class OrdersModule {}
