import { Controller, Get, Logger, Query } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  private readonly logContext = AppController.name;
  constructor(
    private readonly appService: AppService,
    private readonly logger: Logger,
  ) {}

  @Get()
  getHello(): Record<string, string> {
    this.logger.log(`Handling getHello request`, this.logContext);
    return this.appService.healthCheck();
  }

  @Get('success')
  success(@Query('session_id') sessionId?: string) {
    this.logger.log(
      `Handling success redirect sessionId=${sessionId ?? 'n/a'}`,
      this.logContext,
    );

    return {
      ok: true,
      status: 'success',
      sessionId: sessionId ?? null,
    };
  }

  @Get('cancel')
  cancel() {
    this.logger.log(`Handling cancel redirect`, this.logContext);

    return {
      ok: true,
      status: 'cancel',
    };
  }
}
