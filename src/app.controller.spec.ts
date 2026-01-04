import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return healthCheck payload', () => {
      const res = appController.getHello();
      expect(res).toEqual({
        message: 'ok',
        timestamp: expect.any(String) as unknown,
      });
    });
  });

  describe('success', () => {
    it('should include sessionId when provided', () => {
      expect(appController.success('cs_test_123')).toEqual({
        ok: true,
        status: 'success',
        sessionId: 'cs_test_123',
      });
    });

    it('should return null sessionId when missing', () => {
      expect(appController.success(undefined)).toEqual({
        ok: true,
        status: 'success',
        sessionId: null,
      });
    });
  });

  describe('cancel', () => {
    it('should return cancel payload', () => {
      expect(appController.cancel()).toEqual({
        ok: true,
        status: 'cancel',
      });
    });
  });
});
