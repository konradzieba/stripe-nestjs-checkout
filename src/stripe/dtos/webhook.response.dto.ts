export class StripeWebhookResponseDto {
  received!: boolean;
  type?: string;
  sessionId?: string;
}
