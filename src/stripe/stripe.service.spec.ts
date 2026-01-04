import { Test, TestingModule } from '@nestjs/testing';
import { StripeService } from './stripe.service';
import { stripeConfig } from '../config/stripe.config';

describe('StripeService', () => {
  let service: StripeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StripeService,
        {
          provide: stripeConfig.KEY,
          useValue: {
            secretKey: 'sk_test_123',
            webhookSecret: 'whsec_123',
            allowedPriceIds: ['price_123'],
            appUrl: 'http://localhost:3000',
            apiVersion: undefined,
          },
        },
      ],
    }).compile();

    service = module.get<StripeService>(StripeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
