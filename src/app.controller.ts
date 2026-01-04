import { Controller, Get, Logger } from '@nestjs/common';
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
}
