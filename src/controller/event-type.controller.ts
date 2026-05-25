import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { StandardResopnse } from 'src/common';
import { SwaggerApiEnumTags } from 'src/common/index.enum';
import {
  CreatedEventTypeResponseEnvelopeDto,
  CreateEventTypeDto,
  EventTypeDeleteDto,
  EventTypeDeleteResponseEnvelopeDto,
  EventTypeResponseDto,
  EventTypeResponseEnvelopeDto,
  FindEventTypesQueryDto,
  PaginatedEventTypesDto,
  PaginatedEventTypesResponseEnvelopeDto,
  UpdateEventTypeDto,
} from 'src/dtos/event-type.dto';
import { SortOrder } from 'src/dtos/pagination.dto';
import { EventTypeService } from 'src/services/event-type.service';

@Controller('event-type')
@ApiTags(SwaggerApiEnumTags.EVENTTYPE)
@ApiBearerAuth()
export class EventTypeController {
  constructor(private readonly eventTypeService: EventTypeService) {}

  @Post()
  @ApiOperation({ summary: 'Create an event type' })
  @ApiCreatedResponse({ type: CreatedEventTypeResponseEnvelopeDto })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiConflictResponse({
    description: 'An event type with this name already exists',
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  createEventType(
    @Body() createEventTypeDto: CreateEventTypeDto,
  ): Promise<StandardResopnse<EventTypeResponseDto>> {
    return this.eventTypeService.createEventType(createEventTypeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all event types with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'per_page', required: false, type: Number, example: 25 })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: SortOrder,
    example: SortOrder.DESC,
  })
  @ApiQuery({
    name: 'searchQuery',
    required: false,
    type: String,
    example: 'Birthday',
  })
  @ApiQuery({
    name: 'isActive',
    required: false,
    type: Boolean,
    example: true,
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    example: '2026-01-01',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    example: '2026-12-31',
  })
  @ApiOkResponse({ type: PaginatedEventTypesResponseEnvelopeDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  findAllEventTypes(
    @Query() query: FindEventTypesQueryDto,
  ): Promise<StandardResopnse<PaginatedEventTypesDto>> {
    return this.eventTypeService.findAllEventTypes(query);
  }

  @Get('available')
  @ApiOperation({
    summary:
      'Get event types where createdById is null or matches the logged-in user',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'per_page', required: false, type: Number, example: 25 })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: SortOrder,
    example: SortOrder.DESC,
  })
  @ApiQuery({
    name: 'searchQuery',
    required: false,
    type: String,
    example: 'Birthday',
  })
  @ApiQuery({
    name: 'isActive',
    required: false,
    type: Boolean,
    example: true,
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    example: '2026-01-01',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    example: '2026-12-31',
  })
  @ApiOkResponse({ type: PaginatedEventTypesResponseEnvelopeDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  findAvailableEventTypes(
    @Query() query: FindEventTypesQueryDto,
  ): Promise<StandardResopnse<PaginatedEventTypesDto>> {
    return this.eventTypeService.findAvailableEventTypes(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an event type by id' })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ type: EventTypeResponseEnvelopeDto })
  @ApiNotFoundResponse({ description: 'Event type not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  findEventTypeById(
    @Param('id') id: string,
  ): Promise<StandardResopnse<EventTypeResponseDto>> {
    return this.eventTypeService.findEventTypeById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an event type' })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ type: EventTypeResponseEnvelopeDto })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiConflictResponse({
    description: 'An event type with this name already exists',
  })
  @ApiNotFoundResponse({ description: 'Event type not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  updateEventType(
    @Param('id') id: string,
    @Body() updateEventTypeDto: UpdateEventTypeDto,
  ): Promise<StandardResopnse<EventTypeResponseDto>> {
    return this.eventTypeService.updateEventType(id, updateEventTypeDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an event type' })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ type: EventTypeDeleteResponseEnvelopeDto })
  @ApiNotFoundResponse({ description: 'Event type not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  deleteEventType(
    @Param('id') id: string,
  ): Promise<StandardResopnse<EventTypeDeleteDto>> {
    return this.eventTypeService.deleteEventType(id);
  }
}
