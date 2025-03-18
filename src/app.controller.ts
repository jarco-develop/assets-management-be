import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@Controller()
@ApiTags('App')
export class AppController {
  @Get('ping')
  @ApiOperation({ summary: 'Check if the service is online.' })
  @ApiResponse({ status: 200, description: 'A pong response.', type: String })
  ping(): string {
    return 'pong';
  }
}
