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
  GiftMetricsResponseDto,
  GiftMetricsResponseEnvelopeDto,
  HangoutMetricsResponseDto,
  HangoutMetricsResponseEnvelopeDto,
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

  @Get('gift-metrics')
  @ApiOperation({ summary: 'Get gift dashboard metrics' })
  @ApiOkResponse({
    description: 'Gift metrics fetched successfully',
    type: GiftMetricsResponseEnvelopeDto,
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  getGiftMetrics(): Promise<StandardResopnse<GiftMetricsResponseDto>> {
    return this.dashboardService.getGiftMetrics();
  }

  @Get('hangout-metrics')
  @ApiOperation({ summary: 'Get hangout dashboard metrics' })
  @ApiOkResponse({
    description: 'Hangout metrics fetched successfully',
    type: HangoutMetricsResponseEnvelopeDto,
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  getHangoutMetrics(): Promise<StandardResopnse<HangoutMetricsResponseDto>> {
    return this.dashboardService.getHangoutMetrics();
  }
}
