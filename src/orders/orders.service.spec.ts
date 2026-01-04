import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { stripeConfig } from '../config/stripe.config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Order } from './order.entity';

describe('OrdersService', () => {
  let service: OrdersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
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
          provide: getRepositoryToken(Order),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            findOneBy: jest.fn(),
            count: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
