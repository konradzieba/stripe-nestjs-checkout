import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { orderStatuses, type OrderStatus } from './order-status';
import { IsEnum } from 'class-validator';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'text' })
  @IsEnum(orderStatuses)
  status!: OrderStatus;

  // Stripe
  @Index()
  @Column({ type: 'text', nullable: true })
  stripeSessionId!: string | null;

  @Index()
  @Column({ type: 'text', nullable: true })
  stripePaymentIntentId!: string | null;

  @Index('uniq_order_stripe_event_id', {
    unique: true,
    where: '"stripeEventId" IS NOT NULL',
  })
  @Column({ type: 'text', nullable: true })
  stripeEventId!: string | null;

  @Column({ type: 'text' })
  priceId!: string;

  @Column({ type: 'int' })
  quantity!: number;

  @Column({ type: 'text', nullable: true })
  customerEmail!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
