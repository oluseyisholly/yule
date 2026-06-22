import { Controller, Get } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { StandardResopnse } from 'src/common';
import { SwaggerApiEnumTags } from 'src/common/index.enum';
import {
  DrawNameMetricsResponseDto,
  DrawNameMetricsResponseEnvelopeDto,
  WishlistMetricsResponseDto,
  WishlistMetricsResponseEnvelopeDto,
} from 'src/dtos/dashboard.dto';
import { DashboardService } from 'src/services/dashboard.service';

@Controller('dashboard')
@ApiTags(SwaggerApiEnumTags.DASHBOARD)
@ApiBearerAuth()
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('draw-name-metrics')
  @ApiOperation({ summary: 'Get draw name dashboard metrics' })
  @ApiOkResponse({
    description: 'Draw name metrics fetched successfully',
    type: DrawNameMetricsResponseEnvelopeDto,
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  getDrawNameMetrics(): Promise<StandardResopnse<DrawNameMetricsResponseDto>> {
    return this.dashboardService.getDrawNameMetrics();
  }

  @Get('wishlist-metrics')
  @ApiOperation({ summary: 'Get wishlist dashboard metrics' })
  @ApiOkResponse({
    description: 'Wishlist metrics fetched successfully',
    type: WishlistMetricsResponseEnvelopeDto,
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  getWishlistMetrics(): Promise<StandardResopnse<WishlistMetricsResponseDto>> {
    return this.dashboardService.getWishlistMetrics();
  }
}
