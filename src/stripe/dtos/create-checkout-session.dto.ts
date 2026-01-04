import { IsEmail, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateCheckoutSessionDto {
  @ApiProperty({
    description: 'Stripe Price ID to charge',
    example: 'price_123',
  })
  @IsString()
  priceId!: string;

  @ApiProperty({
    description: 'Quantity of the item to charge',
    example: 1,
    minimum: 1,
    required: false,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity?: number;

  @ApiProperty({
    description: 'Customer email to attach to the session',
    example: 'customer@example.com',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  customerEmail?: string;
}
