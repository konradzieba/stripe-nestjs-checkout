import { IsEmail, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateCheckoutSessionDto {
  @IsString()
  priceId!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;

  @IsOptional()
  @IsEmail()
  customerEmail?: string;
}
