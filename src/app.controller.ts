import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiTags } from '@nestjs/swagger';
import { SwaggerApiEnumTags } from './common/index.enum';


@Controller('app')
@ApiTags(SwaggerApiEnumTags.APP)
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
