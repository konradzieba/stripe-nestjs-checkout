export class CreateCheckoutSessionParam {
  priceId: string;
  quantity: number;
  customerEmail?: string;
  metadata?: Record<string, string>;
}
