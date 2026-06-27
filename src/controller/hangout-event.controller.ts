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
  ApiBearerAuth,
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
  CreatedHangoutEventResponseEnvelopeDto,
  CreateHangoutEventDto,
  FindHangoutEventsQueryDto,
  HangoutEventDeleteResponseEnvelopeDto,
  HangoutEventResponseEnvelopeDto,
  PaginatedHangoutEventsResponseEnvelopeDto,
  UpdateHangoutEventDto,
} from 'src/dtos/hangout-event.dto';
import {
  DeleteResponseDto,
  PaginatedRecordsDto,
  SortOrder,
} from 'src/dtos/general.dto';
import { HangoutEvent } from 'src/entities/hangout-event.entity';
import { HangoutEventService } from 'src/services/hangout-event.service';

@Controller('hangout-event')
@ApiTags(SwaggerApiEnumTags.HANGOUTEVENT)
@ApiBearerAuth()
export class HangoutEventController {
  constructor(private readonly hangoutEventService: HangoutEventService) {}

  @Post()
  @ApiOperation({ summary: 'Create a hangout event' })
  @ApiCreatedResponse({
    description: 'Hangout event created successfully',
    type: CreatedHangoutEventResponseEnvelopeDto,
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  createHangoutEvent(
    @Body() createHangoutEventDto: CreateHangoutEventDto,
  ): Promise<StandardResopnse<HangoutEvent>> {
    return this.hangoutEventService.createHangoutEvent(createHangoutEventDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get paginated hangout events' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'per_page', required: false, example: 25 })
  @ApiQuery({ name: 'searchQuery', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: SortOrder,
    example: SortOrder.DESC,
  })
  @ApiOkResponse({
    description: 'Hangout events fetched successfully',
    type: PaginatedHangoutEventsResponseEnvelopeDto,
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  findAllHangoutEvents(
    @Query() query: FindHangoutEventsQueryDto,
  ): Promise<StandardResopnse<PaginatedRecordsDto<HangoutEvent>>> {
    return this.hangoutEventService.findAllHangoutEvents(query);
  }

  @Get('created')
  @ApiOperation({
    summary: 'Get paginated hangout events created by the signed-in user',
  })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'per_page', required: false, example: 25 })
  @ApiQuery({ name: 'searchQuery', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: SortOrder,
    example: SortOrder.DESC,
  })
  @ApiOkResponse({
    description: 'Created hangout events fetched successfully',
    type: PaginatedHangoutEventsResponseEnvelopeDto,
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  findCreatedHangoutEvents(
    @Query() query: FindHangoutEventsQueryDto,
  ): Promise<StandardResopnse<PaginatedRecordsDto<HangoutEvent>>> {
    return this.hangoutEventService.findCreatedHangoutEvents(query);
  }

  @Get('participated')
  @ApiOperation({
    summary: 'Get paginated hangout events the signed-in user participates in',
  })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'per_page', required: false, example: 25 })
  @ApiQuery({ name: 'searchQuery', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: SortOrder,
    example: SortOrder.DESC,
  })
  @ApiOkResponse({
    description: 'Participated hangout events fetched successfully',
    type: PaginatedHangoutEventsResponseEnvelopeDto,
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  findParticipatedHangoutEvents(
    @Query() query: FindHangoutEventsQueryDto,
  ): Promise<StandardResopnse<PaginatedRecordsDto<HangoutEvent>>> {
    return this.hangoutEventService.findParticipatedHangoutEvents(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a hangout event by event id' })
  @ApiParam({ name: 'id', description: 'Hangout event eventId' })
  @ApiOkResponse({
    description: 'Hangout event fetched successfully',
    type: HangoutEventResponseEnvelopeDto,
  })
  @ApiNotFoundResponse({ description: 'Hangout event not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  findHangoutEventById(
    @Param('id') id: string,
  ): Promise<StandardResopnse<HangoutEvent>> {
    return this.hangoutEventService.findHangoutEventById(id);
  }

  @Patch(':id/complete')
  @ApiOperation({ summary: 'Complete a hangout event by event id' })
  @ApiParam({ name: 'id', description: 'Hangout event eventId' })
  @ApiOkResponse({
    description: 'Hangout event completed successfully',
    type: HangoutEventResponseEnvelopeDto,
  })
  @ApiNotFoundResponse({ description: 'Hangout event not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  completeHangoutEvent(
    @Param('id') id: string,
  ): Promise<StandardResopnse<HangoutEvent>> {
    return this.hangoutEventService.completeHangoutEvent(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a hangout event by event id' })
  @ApiParam({ name: 'id', description: 'Hangout event eventId' })
  @ApiOkResponse({
    description: 'Hangout event updated successfully',
    type: HangoutEventResponseEnvelopeDto,
  })
  @ApiNotFoundResponse({ description: 'Hangout event not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  updateHangoutEvent(
    @Param('id') id: string,
    @Body() updateHangoutEventDto: UpdateHangoutEventDto,
  ): Promise<StandardResopnse<HangoutEvent>> {
    return this.hangoutEventService.updateHangoutEvent(
      id,
      updateHangoutEventDto,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a hangout event by event id' })
  @ApiParam({ name: 'id', description: 'Hangout event eventId' })
  @ApiOkResponse({
    description: 'Hangout event deleted successfully',
    type: HangoutEventDeleteResponseEnvelopeDto,
  })
  @ApiNotFoundResponse({ description: 'Hangout event not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  deleteHangoutEvent(
    @Param('id') id: string,
  ): Promise<StandardResopnse<DeleteResponseDto>> {
    return this.hangoutEventService.deleteHangoutEvent(id);
  }
}
