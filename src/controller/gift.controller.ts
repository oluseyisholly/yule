import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
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
  BulkAssignedGiftsResponseEnvelopeDto,
  BulkCreatedGiftsResponseEnvelopeDto,
  CreateBulkGiftAssignmentsDto,
  CreateBulkGiftsDto,
  CreateGiftDto,
  CreatedGiftResponseEnvelopeDto,
  FindGiftsQueryDto,
  GiftDeleteResponseEnvelopeDto,
  GiftResponseEnvelopeDto,
  GroupedGivenGiftResponseDto,
  PaginatedGroupedGivenGiftsResponseEnvelopeDto,
  PaginatedGiftsResponseEnvelopeDto,
  UpdateGiftDto,
} from 'src/dtos/gift.dto';
import {
  DeleteResponseDto,
  PaginatedRecordsDto,
  SortOrder,
} from 'src/dtos/general.dto';
import { EventGift } from 'src/entities/gift.entity';
import { GiftService } from 'src/services/gift.service';

@Controller('gift')
@ApiTags(SwaggerApiEnumTags.GIFT)
@ApiBearerAuth()
export class GiftController {
  constructor(private readonly giftService: GiftService) {}

  @Post()
  @ApiOperation({ summary: 'Create a gift' })
  @ApiCreatedResponse({
    description: 'Gift created successfully',
    type: CreatedGiftResponseEnvelopeDto,
  })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiNotFoundResponse({
    description: 'Event, recipient participant, or giver participant not found',
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  createGift(
    @Body() createGiftDto: CreateGiftDto,
  ): Promise<StandardResopnse<EventGift>> {
    return this.giftService.createGift(createGiftDto);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Create gifts in bulk' })
  @ApiCreatedResponse({
    description: 'Gifts created successfully',
    type: BulkCreatedGiftsResponseEnvelopeDto,
  })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiNotFoundResponse({
    description: 'Event, recipient participant, or giver participant not found',
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  createBulkGifts(
    @Body() createBulkGiftsDto: CreateBulkGiftsDto,
  ): Promise<StandardResopnse<EventGift[]>> {
    return this.giftService.createBulkGifts(createBulkGiftsDto);
  }

  @Post('assign/bulk')
  @ApiOperation({ summary: 'Assign multiple gifts to multiple participants' })
  @ApiCreatedResponse({
    description: 'Gifts assigned successfully',
    type: BulkAssignedGiftsResponseEnvelopeDto,
  })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiNotFoundResponse({
    description: 'Event, giver participant, or recipient participants not found',
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  @HttpCode(HttpStatus.CREATED)
  assignBulkGiftsToParticipants(
    @Body() createBulkGiftAssignmentsDto: CreateBulkGiftAssignmentsDto,
  ): Promise<StandardResopnse<EventGift[]>> {
    return this.giftService.assignBulkGiftsToParticipants(
      createBulkGiftAssignmentsDto,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get paginated gifts' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'per_page', required: false, type: Number, example: 25 })
  @ApiQuery({ name: 'searchQuery', required: false, type: String })
  @ApiQuery({ name: 'eventId', required: false, type: String })
  @ApiQuery({ name: 'recipientParticipantId', required: false, type: String })
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
    description: 'Gifts fetched successfully',
    type: PaginatedGiftsResponseEnvelopeDto,
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  findAllGifts(
    @Query() query: FindGiftsQueryDto,
  ): Promise<StandardResopnse<PaginatedRecordsDto<EventGift>>> {
    return this.giftService.findAllGifts(query);
  }

  @Get('event/:eventId/selected')
  @ApiOperation({
    summary: 'Get paginated selected gifts for all participants in an event',
  })
  @ApiParam({ name: 'eventId', type: String })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'per_page', required: false, type: Number, example: 25 })
  @ApiQuery({ name: 'searchQuery', required: false, type: String })
  @ApiQuery({ name: 'recipientParticipantId', required: false, type: String })
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
    description: 'Event selected gifts fetched successfully',
    type: PaginatedGiftsResponseEnvelopeDto,
  })
  @ApiNotFoundResponse({ description: 'Event not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  findSelectedGiftsForEvent(
    @Param('eventId') eventId: string,
    @Query() query: FindGiftsQueryDto,
  ): Promise<StandardResopnse<PaginatedRecordsDto<EventGift>>> {
    return this.giftService.findSelectedGiftsForEvent(eventId, query);
  }

  @Get('given/grouped')
  @ApiOperation({
    summary:
      'Get grouped gifts given by the signed-in contact across all events with recipient details',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'per_page', required: false, type: Number, example: 25 })
  @ApiQuery({ name: 'searchQuery', required: false, type: String })
  @ApiQuery({ name: 'recipientParticipantId', required: false, type: String })
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
    description: 'Grouped given gifts fetched successfully',
    type: PaginatedGroupedGivenGiftsResponseEnvelopeDto,
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  findMyGroupedGivenGifts(
    @Query() query: FindGiftsQueryDto,
  ): Promise<
    StandardResopnse<PaginatedRecordsDto<GroupedGivenGiftResponseDto>>
  > {
    return this.giftService.findMyGroupedGivenGifts(query);
  }

  @Get('event/:eventId/given/grouped')
  @ApiOperation({
    summary:
      'Get grouped gifts given by the signed-in contact in an event with recipient details',
  })
  @ApiParam({ name: 'eventId', type: String })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'per_page', required: false, type: Number, example: 25 })
  @ApiQuery({ name: 'searchQuery', required: false, type: String })
  @ApiQuery({ name: 'recipientParticipantId', required: false, type: String })
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
    description: 'Grouped given gifts fetched successfully',
    type: PaginatedGroupedGivenGiftsResponseEnvelopeDto,
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  findMyGroupedGivenGiftsForEvent(
    @Param('eventId') eventId: string,
    @Query() query: FindGiftsQueryDto,
  ): Promise<
    StandardResopnse<PaginatedRecordsDto<GroupedGivenGiftResponseDto>>
  > {
    return this.giftService.findMyGroupedGivenGiftsForEvent(eventId, query);
  }

  @Get('claimed')
  @ApiOperation({
    summary: 'Get paginated gifts claimed by the signed-in participant',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'per_page', required: false, type: Number, example: 25 })
  @ApiQuery({ name: 'searchQuery', required: false, type: String })
  @ApiQuery({ name: 'eventId', required: false, type: String })
  @ApiQuery({ name: 'recipientParticipantId', required: false, type: String })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: SortOrder,
    example: SortOrder.DESC,
  })
  @ApiOkResponse({
    description: 'Claimed gifts fetched successfully',
    type: PaginatedGiftsResponseEnvelopeDto,
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  findMyClaimedGifts(
    @Query() query: FindGiftsQueryDto,
  ): Promise<StandardResopnse<PaginatedRecordsDto<EventGift>>> {
    return this.giftService.findMyClaimedGifts(query);
  }

  @Get('given')
  @ApiOperation({
    summary: 'Get paginated gifts given by the signed-in contact across events',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'per_page', required: false, type: Number, example: 25 })
  @ApiQuery({ name: 'searchQuery', required: false, type: String })
  @ApiQuery({ name: 'eventId', required: false, type: String })
  @ApiQuery({ name: 'recipientParticipantId', required: false, type: String })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: SortOrder,
    example: SortOrder.DESC,
  })
  @ApiOkResponse({
    description: 'Given gifts fetched successfully',
    type: PaginatedGiftsResponseEnvelopeDto,
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  findMyGivenGifts(
    @Query() query: FindGiftsQueryDto,
  ): Promise<StandardResopnse<PaginatedRecordsDto<EventGift>>> {
    return this.giftService.findMyGivenGifts(query);
  }

  @Get('received')
  @ApiOperation({
    summary: 'Get paginated gifts received by the signed-in contact across events',
  })
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
    description: 'Received gifts fetched successfully',
    type: PaginatedGiftsResponseEnvelopeDto,
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  findMyReceivedGifts(
    @Query() query: FindGiftsQueryDto,
  ): Promise<StandardResopnse<PaginatedRecordsDto<EventGift>>> {
    return this.giftService.findMyReceivedGifts(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a gift by id' })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({
    description: 'Gift fetched successfully',
    type: GiftResponseEnvelopeDto,
  })
  @ApiNotFoundResponse({ description: 'Gift not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  findGiftById(@Param('id') id: string): Promise<StandardResopnse<EventGift>> {
    return this.giftService.findGiftById(id);
  }

  @Patch(':id/claim')
  @ApiOperation({
    summary: 'Claim a gift as the signed-in participant',
  })
  @ApiParam({ name: 'id', type: String, description: 'Gift id' })
  @ApiOkResponse({
    description: 'Gift claimed successfully',
    type: GiftResponseEnvelopeDto,
  })
  @ApiBadRequestResponse({ description: 'You cannot claim your own gift' })
  @ApiConflictResponse({ description: 'Gift has already been claimed' })
  @ApiNotFoundResponse({
    description: 'Gift or participant not found',
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  claimGift(@Param('id') id: string): Promise<StandardResopnse<EventGift>> {
    return this.giftService.claimGift(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a gift' })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({
    description: 'Gift updated successfully',
    type: GiftResponseEnvelopeDto,
  })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiNotFoundResponse({
    description: 'Gift, event, recipient participant, or giver participant not found',
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  updateGift(
    @Param('id') id: string,
    @Body() updateGiftDto: UpdateGiftDto,
  ): Promise<StandardResopnse<EventGift>> {
    return this.giftService.updateGift(id, updateGiftDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a gift' })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({
    description: 'Gift deleted successfully',
    type: GiftDeleteResponseEnvelopeDto,
  })
  @ApiNotFoundResponse({ description: 'Gift not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  deleteGift(
    @Param('id') id: string,
  ): Promise<StandardResopnse<DeleteResponseDto>> {
    return this.giftService.deleteGift(id);
  }
}
