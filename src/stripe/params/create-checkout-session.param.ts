import { Type } from 'class-transformer';
import { IsString } from 'class-validator';

export class CreateCheckoutSessionParam {
  @IsString()
  priceId: string;

  @Type(() => Number)
  quantity: number;

  @IsString()
  customerEmail?: string;

  @Type(() => Object)
  metadata?: Record<string, string>;
}
