import { Test, TestingModule } from '@nestjs/testing';
import { StripeController } from './stripe.controller';
import { StripeService } from './stripe.service';
import { OrdersService } from '../orders/orders.service';
import { stripeConfig } from '../config/stripe.config';
import { Logger } from '@nestjs/common';

describe('StripeController', () => {
  let controller: StripeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StripeController],
      providers: [
        Logger,
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
        {
          provide: OrdersService,
          useValue: {
            createPending: jest.fn(),
            attachStripeSession: jest.fn(),
            markFailed: jest.fn(),
            markPaidByOrderId: jest.fn(),
            setStripeEventId: jest.fn(),
            existsByStripeEventId: jest.fn(),
          },
        },
        {
          provide: StripeService,
          useValue: {
            client: { accounts: { retrieve: jest.fn() } },
            createCheckoutSession: jest.fn(),
            constructWebhookEvent: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<StripeController>(StripeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
