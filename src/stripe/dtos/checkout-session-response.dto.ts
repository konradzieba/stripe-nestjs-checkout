import { ApiProperty } from '@nestjs/swagger';

export class CheckoutSessionResponseDto {
  @ApiProperty({ description: 'Checkout Session ID', example: 'cs_test_123' })
  id!: string;

  @ApiProperty({
    description: 'Hosted checkout URL (nullable if not returned by Stripe)',
    example: 'https://checkout.stripe.com/c/pay_123',
    nullable: true,
  })
  url!: string | null;
}
