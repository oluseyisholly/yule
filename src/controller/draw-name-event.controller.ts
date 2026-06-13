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
  CreatedDrawNameEventResponseEnvelopeDto,
  CreateDrawNameEventDto,
  DrawNameEventDeleteResponseEnvelopeDto,
  DrawNameEventDrawResponseEnvelopeDto,
  DrawNameEventResponseEnvelopeDto,
  FindDrawNameEventsQueryDto,
  PaginatedDrawNameEventsResponseEnvelopeDto,
  UpdateDrawNameEventDto,
} from 'src/dtos/draw-name-event.dto';
import {
  DeleteResponseDto,
  PaginatedRecordsDto,
  SortOrder,
} from 'src/dtos/general.dto';
import { DrawNameEvent } from 'src/entities/draw-name-event.entity';
import { EventParticipant } from 'src/entities/event-participant.entity';
import { DrawNameEventService } from 'src/services/draw-name-event.service';
import { ParticipantService } from 'src/services/participant.service';
import {
  FindParticipantsQueryDto,
  PaginatedParticipantsResponseEnvelopeDto,
  ParticipantContactIdsResponseEnvelopeDto,
} from 'src/dtos/participant.dto';

@Controller('draw-name-event')
@ApiTags(SwaggerApiEnumTags.DRAWNAMEEVENT)
@ApiBearerAuth()
export class DrawNameEventController {
  constructor(
    private readonly drawNameEventService: DrawNameEventService,
    private readonly participantService: ParticipantService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a draw name event' })
  @ApiCreatedResponse({
    description: 'Draw name event created successfully',
    type: CreatedDrawNameEventResponseEnvelopeDto,
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  createDrawNameEvent(
    @Body() createDrawNameEventDto: CreateDrawNameEventDto,
  ): Promise<StandardResopnse<DrawNameEvent>> {
    return this.drawNameEventService.createDrawNameEvent(
      createDrawNameEventDto,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get paginated draw name events' })
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
    description: 'Draw name events fetched successfully',
    type: PaginatedDrawNameEventsResponseEnvelopeDto,
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  findAllDrawNameEvents(
    @Query() query: FindDrawNameEventsQueryDto,
  ): Promise<StandardResopnse<PaginatedRecordsDto<DrawNameEvent>>> {
    return this.drawNameEventService.findAllDrawNameEvents(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a draw name event by draw name event id' })
  @ApiParam({ name: 'id', description: 'Draw name event id' })
  @ApiOkResponse({
    description: 'Draw name event fetched successfully',
    type: DrawNameEventResponseEnvelopeDto,
  })
  @ApiNotFoundResponse({ description: 'Draw name event not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  findDrawNameEventById(
    @Param('id') id: string,
  ): Promise<StandardResopnse<DrawNameEvent>> {
    return this.drawNameEventService.findDrawNameEventById(id);
  }

  @Post(':id/draw')
  @ApiOperation({
    summary: 'Randomly assign gift givers for a draw name event',
  })
  @ApiParam({ name: 'id', description: 'Draw name event id' })
  @ApiOkResponse({
    description: 'Draw names assigned successfully',
    type: DrawNameEventDrawResponseEnvelopeDto,
  })
  @ApiBadRequestResponse({
    description: 'Event is not draft or valid draw assignment is impossible',
  })
  @ApiNotFoundResponse({ description: 'Draw name event not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  drawNames(
    @Param('id') id: string,
  ): Promise<StandardResopnse<EventParticipant[]>> {
    return this.drawNameEventService.drawNames(id);
  }

  @Get(':id/participant')
  @ApiOperation({ summary: 'Get paginated participants for a draw name event' })
  @ApiParam({ name: 'id', description: 'Draw name event id' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'per_page', required: false, example: 25 })
  @ApiQuery({ name: 'contactId', required: false })
  @ApiQuery({ name: 'role', required: false })
  @ApiQuery({
    name: 'unpairedOnly',
    required: false,
    type: Boolean,
    description: 'Return only participants without an assigned gift giver',
  })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: SortOrder,
    example: SortOrder.DESC,
  })
  @ApiOkResponse({
    description: 'Draw name event participants fetched successfully',
    type: PaginatedParticipantsResponseEnvelopeDto,
  })
  @ApiNotFoundResponse({ description: 'Draw name event not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  findDrawNameEventParticipants(
    @Param('id') id: string,
    @Query() query: FindParticipantsQueryDto,
  ): Promise<StandardResopnse<PaginatedRecordsDto<EventParticipant>>> {
    return this.participantService.findParticipantsByDrawNameEventId(id, query);
  }

  @Get(':id/participant/contact-ids')
  @ApiOperation({
    summary: 'Get participant contact ids for a draw name event',
  })
  @ApiParam({ name: 'id', description: 'Draw name event id' })
  @ApiOkResponse({
    description: 'Draw name event participant contact ids fetched successfully',
    type: ParticipantContactIdsResponseEnvelopeDto,
  })
  @ApiNotFoundResponse({ description: 'Draw name event not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  findDrawNameEventParticipantContactIds(
    @Param('id') id: string,
  ): Promise<StandardResopnse<string[]>> {
    return this.participantService.findParticipantContactIdsByDrawNameEventId(
      id,
    );
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a draw name event by draw name event id' })
  @ApiParam({ name: 'id', description: 'Draw name event id' })
  @ApiOkResponse({
    description: 'Draw name event updated successfully',
    type: DrawNameEventResponseEnvelopeDto,
  })
  @ApiNotFoundResponse({ description: 'Draw name event not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  updateDrawNameEvent(
    @Param('id') id: string,
    @Body() updateDrawNameEventDto: UpdateDrawNameEventDto,
  ): Promise<StandardResopnse<DrawNameEvent>> {
    return this.drawNameEventService.updateDrawNameEvent(
      id,
      updateDrawNameEventDto,
    );
  }

  @Patch(':id/complete')
  @ApiOperation({ summary: 'Complete a draw name event by draw name event id' })
  @ApiParam({ name: 'id', description: 'Draw name event id' })
  @ApiOkResponse({
    description: 'Draw name event completed successfully',
    type: DrawNameEventResponseEnvelopeDto,
  })
  @ApiNotFoundResponse({ description: 'Draw name event not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  completeDrawNameEvent(
    @Param('id') id: string,
  ): Promise<StandardResopnse<DrawNameEvent>> {
    return this.drawNameEventService.completeDrawNameEvent(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a draw name event by draw name event id' })
  @ApiParam({ name: 'id', description: 'Draw name event id' })
  @ApiOkResponse({
    description: 'Draw name event deleted successfully',
    type: DrawNameEventDeleteResponseEnvelopeDto,
  })
  @ApiNotFoundResponse({ description: 'Draw name event not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  deleteDrawNameEvent(
    @Param('id') id: string,
  ): Promise<StandardResopnse<DeleteResponseDto>> {
    return this.drawNameEventService.deleteDrawNameEvent(id);
  }
}
