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
  DeleteResponseDto,
  PaginatedRecordsDto,
  SortOrder,
} from 'src/dtos/general.dto';
import {
  FindParticipantGiftSelectionsQueryDto,
  FindGiftsQueryDto,
  GiftSelectionsResponseEnvelopeDto,
  PaginatedGiftsResponseEnvelopeDto,
} from 'src/dtos/gift.dto';
import {
  BulkAssignedParticipantGiversResponseEnvelopeDto,
  BulkCreatedParticipantsResponseEnvelopeDto,
  BulkAssignParticipantGiversDto,
  CreateBulkParticipantDto,
  CreateParticipantDto,
  CreatedParticipantResponseEnvelopeDto,
  FindMyGiftRecipientQueryDto,
  FindParticipantsQueryDto,
  MyGiftRecipientResponseEnvelopeDto,
  MyParticipantByEventResponseEnvelopeDto,
  PaginatedParticipantsResponseEnvelopeDto,
  ParticipantDeleteResponseEnvelopeDto,
  ParticipantResponseEnvelopeDto,
  UpdateMyParticipantByEventDto,
  UpdateParticipantDto,
} from 'src/dtos/participant.dto';
import {
  EventParticipant,
  EventParticipantRole,
} from 'src/entities/event-participant.entity';
import { EventGift } from 'src/entities/gift.entity';
import { GiftService } from 'src/services/gift.service';
import { ParticipantService } from 'src/services/participant.service';

@Controller('participant')
@ApiTags(SwaggerApiEnumTags.PARTICIPANT)
@ApiBearerAuth()
export class ParticipantController {
  constructor(
    private readonly participantService: ParticipantService,
    private readonly giftService: GiftService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a participant' })
  @ApiCreatedResponse({
    description: 'Participant created successfully',
    type: CreatedParticipantResponseEnvelopeDto,
  })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiNotFoundResponse({ description: 'Event not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  createParticipant(
    @Body() createParticipantDto: CreateParticipantDto,
  ): Promise<StandardResopnse<EventParticipant>> {
    return this.participantService.createParticipant(createParticipantDto);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Create participants in bulk from contact ids' })
  @ApiCreatedResponse({
    description: 'Participants created successfully',
    type: BulkCreatedParticipantsResponseEnvelopeDto,
  })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiNotFoundResponse({ description: 'Event not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  createBulkParticipants(
    @Body() createBulkParticipantDto: CreateBulkParticipantDto,
  ): Promise<StandardResopnse<EventParticipant[]>> {
    return this.participantService.createBulkParticipants(
      createBulkParticipantDto,
    );
  }

  @Post('bulk-assign-givers')
  @ApiOperation({ summary: 'Bulk assign participants to their gift givers' })
  @ApiOkResponse({
    description: 'Participant givers assigned successfully',
    type: BulkAssignedParticipantGiversResponseEnvelopeDto,
  })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiNotFoundResponse({ description: 'Participant not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  bulkAssignParticipantGivers(
    @Body() bulkAssignParticipantGiversDto: BulkAssignParticipantGiversDto,
  ): Promise<StandardResopnse<EventParticipant[]>> {
    return this.participantService.bulkAssignParticipantGivers(
      bulkAssignParticipantGiversDto,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get paginated participants' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'per_page', required: false, type: Number, example: 25 })
  @ApiQuery({ name: 'eventId', required: false, type: String })
  @ApiQuery({ name: 'contactId', required: false, type: String })
  @ApiQuery({ name: 'role', required: false, enum: EventParticipantRole })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: SortOrder,
    example: SortOrder.DESC,
  })
  @ApiOkResponse({
    description: 'Participants fetched successfully',
    type: PaginatedParticipantsResponseEnvelopeDto,
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  findAllParticipants(
    @Query() query: FindParticipantsQueryDto,
  ): Promise<StandardResopnse<PaginatedRecordsDto<EventParticipant>>> {
    return this.participantService.findAllParticipants(query);
  }

  @Get('me/gift-recipient')
  @ApiOperation({
    summary:
      'Get the signed-in participant gift recipient for a draw name event',
  })
  @ApiQuery({ name: 'drawNameEventId', required: true, type: String })
  @ApiOkResponse({
    description: 'Gift recipient fetched successfully',
    type: MyGiftRecipientResponseEnvelopeDto,
  })
  @ApiNotFoundResponse({
    description: 'Participant not found for this draw name event',
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  findMyGiftRecipient(
    @Query() query: FindMyGiftRecipientQueryDto,
  ): Promise<StandardResopnse<EventParticipant | null>> {
    return this.participantService.findMyGiftRecipient(query);
  }

  @Get('event/:eventId/me')
  @ApiOperation({
    summary: 'Get signed-in participant for an event',
  })
  @ApiParam({ name: 'eventId', type: String })
  @ApiOkResponse({
    description: 'Participant fetched successfully',
    type: MyParticipantByEventResponseEnvelopeDto,
  })
  @ApiNotFoundResponse({ description: 'Participant not found for this event' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  findMyParticipantByEventId(
    @Param('eventId') eventId: string,
  ): Promise<StandardResopnse<EventParticipant>> {
    return this.participantService.findMyParticipantByEventId(eventId);
  }

  @Get('event/:eventId/me/gift-recipient')
  @ApiOperation({
    summary: 'Get who the signed-in participant should give a gift to',
  })
  @ApiParam({ name: 'eventId', type: String })
  @ApiOkResponse({
    description: 'Gift recipient fetched successfully',
    type: MyGiftRecipientResponseEnvelopeDto,
  })
  @ApiNotFoundResponse({ description: 'Participant not found for this event' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  findMyGiftRecipientByEventId(
    @Param('eventId') eventId: string,
  ): Promise<StandardResopnse<EventParticipant | null>> {
    return this.participantService.findMyGiftRecipientByEventId(eventId);
  }

  @Get('event/:eventId/me/gift-recipient/gifts')
  @ApiOperation({
    summary: 'Get paginated selected gifts for the signed-in participant recipient',
  })
  @ApiParam({ name: 'eventId', type: String })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'per_page', required: false, type: Number, example: 25 })
  @ApiQuery({ name: 'searchQuery', required: false, type: String })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: SortOrder,
    example: SortOrder.DESC,
  })
  @ApiOkResponse({
    description: 'Gift recipient gifts fetched successfully',
    type: PaginatedGiftsResponseEnvelopeDto,
  })
  @ApiNotFoundResponse({ description: 'Participant or gift recipient not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  findMyGiftRecipientGifts(
    @Param('eventId') eventId: string,
    @Query() query: FindGiftsQueryDto,
  ): Promise<StandardResopnse<PaginatedRecordsDto<EventGift>>> {
    return this.giftService.findMyGiftRecipientGifts(eventId, query);
  }

  @Post('event/:eventId/me/draw-name')
  @ApiOperation({
    summary: 'Activate and fetch who the signed-in participant should gift',
  })
  @ApiParam({ name: 'eventId', type: String })
  @ApiOkResponse({
    description: 'Draw name fetched successfully',
    type: MyGiftRecipientResponseEnvelopeDto,
  })
  @ApiBadRequestResponse({
    description: 'Draw name has not been assigned for this event',
  })
  @ApiNotFoundResponse({ description: 'Participant not found for this event' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  drawMyNameByEventId(
    @Param('eventId') eventId: string,
  ): Promise<StandardResopnse<EventParticipant | null>> {
    return this.participantService.drawMyNameByEventId(eventId);
  }

  @Get(':id/gift/selections')
  @ApiOperation({
    summary: 'Get selected gift ids for a participant without pagination',
  })
  @ApiParam({ name: 'id', type: String, description: 'Participant id' })
  @ApiQuery({ name: 'eventId', required: true, type: String })
  @ApiOkResponse({
    description: 'Participant gift selections fetched successfully',
    type: GiftSelectionsResponseEnvelopeDto,
  })
  @ApiNotFoundResponse({ description: 'Participant not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  findParticipantGiftSelections(
    @Param('id') id: string,
    @Query() query: FindParticipantGiftSelectionsQueryDto,
  ): Promise<StandardResopnse<Array<{ id: string; participantGiftId: string }>>> {
    return this.giftService.findParticipantGiftSelections(id, query);
  }

  @Get(':id/gift')
  @ApiOperation({ summary: 'Get paginated gifts for a participant' })
  @ApiParam({ name: 'id', type: String, description: 'Participant id' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'per_page', required: false, type: Number, example: 25 })
  @ApiQuery({ name: 'searchQuery', required: false, type: String })
  @ApiQuery({ name: 'eventId', required: false, type: String })
  @ApiQuery({ name: 'giverParticipantId', required: false, type: String })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: SortOrder,
    example: SortOrder.DESC,
  })
  @ApiOkResponse({
    description: 'Participant gifts fetched successfully',
    type: PaginatedGiftsResponseEnvelopeDto,
  })
  @ApiNotFoundResponse({ description: 'Participant not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  findParticipantGifts(
    @Param('id') id: string,
    @Query() query: FindGiftsQueryDto,
  ): Promise<StandardResopnse<PaginatedRecordsDto<EventGift>>> {
    return this.giftService.findParticipantGifts(id, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a participant by id' })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({
    description: 'Participant fetched successfully',
    type: ParticipantResponseEnvelopeDto,
  })
  @ApiNotFoundResponse({ description: 'Participant not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  findParticipantById(
    @Param('id') id: string,
  ): Promise<StandardResopnse<EventParticipant>> {
    return this.participantService.findParticipantById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a participant' })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({
    description: 'Participant updated successfully',
    type: ParticipantResponseEnvelopeDto,
  })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiNotFoundResponse({ description: 'Participant or event not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  updateParticipant(
    @Param('id') id: string,
    @Body() updateParticipantDto: UpdateParticipantDto,
  ): Promise<StandardResopnse<EventParticipant>> {
    return this.participantService.updateParticipant(id, updateParticipantDto);
  }

  @Patch('event/:eventId/me')
  @ApiOperation({
    summary: 'Update signed-in participant preferences by event id',
  })
  @ApiParam({ name: 'eventId', type: String })
  @ApiOkResponse({
    description: 'Participant updated successfully',
    type: ParticipantResponseEnvelopeDto,
  })
  @ApiNotFoundResponse({ description: 'Participant not found for this event' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  updateMyParticipantByEventId(
    @Param('eventId') eventId: string,
    @Body() updateMyParticipantByEventDto: UpdateMyParticipantByEventDto,
  ): Promise<StandardResopnse<EventParticipant>> {
    return this.participantService.updateMyParticipantByEventId(
      eventId,
      updateMyParticipantByEventDto,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a participant' })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({
    description: 'Participant deleted successfully',
    type: ParticipantDeleteResponseEnvelopeDto,
  })
  @ApiNotFoundResponse({ description: 'Participant not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  deleteParticipant(
    @Param('id') id: string,
  ): Promise<StandardResopnse<DeleteResponseDto>> {
    return this.participantService.deleteParticipant(id);
  }
}
