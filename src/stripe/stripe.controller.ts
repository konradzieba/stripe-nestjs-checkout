import { Body, Controller, Post } from '@nestjs/common';
import { PingDto } from './dtos/ping.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('stripe')
@Controller('stripe')
export class StripeController {
  @Post('ping')
  @ApiOperation({ summary: 'Ping endpoint' })
  @ApiResponse({ status: 200, description: 'OK' })
  @ApiBody({ type: PingDto })
  ping(@Body() dto: PingDto) {
    return { ok: true, email: dto.email };
  }
}
