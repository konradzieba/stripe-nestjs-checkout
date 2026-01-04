import { BadRequestException, INestApplication, Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import express from 'express';
import type { Request } from 'express';

import { StripeController } from '../src/stripe/stripe.controller';
import { StripeService } from '../src/stripe/stripe.service';
import { OrdersService } from '../src/orders/orders.service';

type RawBodyRequest = Request & { rawBody?: Buffer };
type ErrorBody = {
  message: string | string[];
  error?: string;
  statusCode?: number;
};

const stripeServiceMock = {
  client: {
    accounts: {
      retrieve: jest.fn(),
    },
  },
  createCheckoutSession: jest.fn(),
  constructWebhookEvent: jest.fn(),
};

const ordersServiceMock = {
  createPending: jest.fn(),
  attachStripeSession: jest.fn(),
  markFailed: jest.fn(),
  markPaidByOrderId: jest.fn(),
  setStripeEventId: jest.fn(),
  existsByStripeEventId: jest.fn(),
};

describe('StripeController (e2e)', () => {
  let app: INestApplication;
  let httpServer: Parameters<typeof request>[0];

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [StripeController],
      providers: [
        Logger,
        { provide: StripeService, useValue: stripeServiceMock },
        { provide: OrdersService, useValue: ordersServiceMock },
      ],
    }).compile();

    app = moduleRef.createNestApplication();

    // Capture rawBody for Stripe webhook signature verification
    app.use(
      express.json({
        verify: (req, _res, buf) => {
          (req as RawBodyRequest).rawBody = buf;
        },
      }),
    );

    await app.init();
    httpServer = app.getHttpServer() as unknown as Parameters<
      typeof request
    >[0];
  });

  beforeEach(() => {
    jest.clearAllMocks();

    stripeServiceMock.client.accounts.retrieve.mockResolvedValue({
      id: 'acct_123',
    });

    stripeServiceMock.createCheckoutSession.mockResolvedValue({
      id: 'cs_test_123',
      url: 'https://checkout.stripe.com/cs_test_123',
    });

    stripeServiceMock.constructWebhookEvent.mockReset();

    ordersServiceMock.createPending.mockResolvedValue({ id: 'order_1' });
    ordersServiceMock.attachStripeSession.mockResolvedValue(undefined);
    ordersServiceMock.markFailed.mockResolvedValue(undefined);
    ordersServiceMock.markPaidByOrderId.mockResolvedValue(undefined);
    ordersServiceMock.setStripeEventId.mockResolvedValue(undefined);
    ordersServiceMock.existsByStripeEventId.mockResolvedValue(false);
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /stripe/checkout-session returns session and attaches order', async () => {
    const res = await request(httpServer)
      .post('/stripe/checkout-session')
      .send({
        priceId: 'price_ok',
        quantity: 2,
        customerEmail: 'x@example.com',
      })
      .expect(201);

    expect(res.body).toEqual({
      id: 'cs_test_123',
      url: 'https://checkout.stripe.com/cs_test_123',
    });

    expect(ordersServiceMock.createPending).toHaveBeenCalledTimes(1);

    expect(ordersServiceMock.attachStripeSession).toHaveBeenCalledWith(
      'order_1',
      'cs_test_123',
    );

    expect(stripeServiceMock.createCheckoutSession).toHaveBeenCalledWith({
      priceId: 'price_ok',
      quantity: 2,
      customerEmail: 'x@example.com',
      metadata: { source: 'nestjs', orderId: 'order_1' },
    });

    expect(ordersServiceMock.markFailed).not.toHaveBeenCalled();
  });

  it('POST /stripe/checkout-session marks order FAILED when Stripe rejects price', async () => {
    stripeServiceMock.createCheckoutSession.mockRejectedValue(
      new BadRequestException('Unsupported priceId'),
    );

    const res = await request(httpServer)
      .post('/stripe/checkout-session')
      .send({ priceId: 'bad_price', quantity: 1 })
      .expect(400);

    const body = res.body as ErrorBody;
    expect(body.message).toBe('Unsupported priceId');

    expect(ordersServiceMock.markFailed).toHaveBeenCalledWith('order_1');
    expect(ordersServiceMock.attachStripeSession).not.toHaveBeenCalled();
  });

  it('GET /stripe/health returns account id', async () => {
    await request(httpServer)
      .get('/stripe/health')
      .expect(200)
      .expect({ ok: true, accountId: 'acct_123' });
  });

  it('POST /stripe/webhook ignores duplicate event id', async () => {
    ordersServiceMock.existsByStripeEventId.mockResolvedValue(true);

    stripeServiceMock.constructWebhookEvent.mockReturnValue({
      id: 'evt_1',
      type: 'payment_intent.succeeded',
      data: { object: {} },
    });

    const payload = { dummy: true };

    await request(httpServer)
      .post('/stripe/webhook')
      .set('stripe-signature', 'sig')
      .send(payload)
      .expect(200)
      .expect({ received: true });

    expect(ordersServiceMock.markPaidByOrderId).not.toHaveBeenCalled();
  });

  it('POST /stripe/webhook processes checkout.session.completed', async () => {
    ordersServiceMock.existsByStripeEventId.mockResolvedValue(false);

    stripeServiceMock.constructWebhookEvent.mockReturnValue({
      id: 'evt_2',
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_123',
          metadata: { orderId: 'order_1' },
          payment_intent: 'pi_123',
        },
      },
    });

    const payload = { dummy: true };

    await request(httpServer)
      .post('/stripe/webhook')
      .set('stripe-signature', 'sig')
      .send(payload)
      .expect(200)
      .expect({ received: true });

    expect(ordersServiceMock.setStripeEventId).toHaveBeenCalledWith(
      'order_1',
      'evt_2',
    );

    expect(ordersServiceMock.markPaidByOrderId).toHaveBeenCalledWith(
      'order_1',
      'pi_123',
    );
  });
});
