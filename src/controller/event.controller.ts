import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { StandardResopnse } from 'src/common';
import { SwaggerApiEnumTags } from 'src/common/index.enum';
import {
  FindParticipatedEventsQueryDto,
  PaginatedEventsResponseEnvelopeDto,
} from 'src/dtos/event.dto';
import { PaginatedRecordsDto, SortOrder } from 'src/dtos/general.dto';
import { Event } from 'src/entities/event.entity';
import { EventService } from 'src/services/event.service';

@Controller('events')
@ApiTags(SwaggerApiEnumTags.EVENT)
@ApiBearerAuth()
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Get('participated')
  @ApiOperation({
    summary:
      'Get paginated events the logged-in user has participated in',
  })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'per_page', required: false, example: 25 })
  @ApiQuery({ name: 'searchQuery', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'eventOption', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: SortOrder,
    example: SortOrder.DESC,
  })
  @ApiOkResponse({
    description: 'Participated events fetched successfully',
    type: PaginatedEventsResponseEnvelopeDto,
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  findParticipatedEvents(
    @Query() query: FindParticipatedEventsQueryDto,
  ): Promise<StandardResopnse<PaginatedRecordsDto<Event>>> {
    return this.eventService.findParticipatedEvents(query);
  }
}
