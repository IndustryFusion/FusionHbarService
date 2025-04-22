import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('App')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Get Hello World message' })
  @ApiResponse({ status: 200, description: 'Returns the hello world string.'})
  @ApiResponse({ status: 500, description: 'Internal server error.'})
  getHello(): string {
    return this.appService.getHello();
  }
}
