import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { SwaggerApiEnumTags } from '../common/index.enum';

import { AuthGuard } from '@nestjs/passport';
import { Public } from 'src/decorators/skipAuth.decorator';

@Controller('externalAuth')
@ApiTags(SwaggerApiEnumTags.USER)
@ApiBearerAuth()
@Public()
export class ExternalAUthController {
  @Get('facebook')
  @UseGuards(AuthGuard('facebook'))
  async facebookLogin(): Promise<void> {
    // This triggers the Facebook login redirection
    
  }

  @Get('facebook/callback')
  @UseGuards(AuthGuard('facebook'))
  async facebookCallback(@Req() req, @Res() res): Promise<void> {
    res.redirect('/dashboard'); // Redirect user after authentication
  }
}
