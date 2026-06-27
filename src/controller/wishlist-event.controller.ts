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
import { Public } from 'src/decorators/skipAuth.decorator';
import {
  CreatedWishlistEventResponseEnvelopeDto,
  CreateWishlistEventDto,
  FindWishlistEventsQueryDto,
  PaginatedWishlistEventsResponseEnvelopeDto,
  PublicWishlistEventResponseDto,
  PublicWishlistEventResponseEnvelopeDto,
  UpdateWishlistEventDto,
  WishlistEventDeleteResponseEnvelopeDto,
  WishlistEventResponseEnvelopeDto,
} from 'src/dtos/wishlist-event.dto';
import {
  DeleteResponseDto,
  PaginatedRecordsDto,
  SortOrder,
} from 'src/dtos/general.dto';
import {
  ClaimedGiftIdsResponseEnvelopeDto,
  FindGiftsQueryDto,
  PaginatedGiftsResponseEnvelopeDto,
} from 'src/dtos/gift.dto';
import {
  CreatedParticipantResponseEnvelopeDto,
  ParticipantResponseEnvelopeDto,
} from 'src/dtos/participant.dto';
import { EventParticipant } from 'src/entities/event-participant.entity';
import { EventGift } from 'src/entities/gift.entity';
import { WishlistEvent } from 'src/entities/wishlist-event.entity';
import { GiftService } from 'src/services/gift.service';
import { WishlistEventService } from 'src/services/wishlist-event.service';

@Controller('wishlist-event')
@ApiTags(SwaggerApiEnumTags.WISHLISTEVENT)
@ApiBearerAuth()
export class WishlistEventController {
  constructor(
    private readonly wishlistEventService: WishlistEventService,
    private readonly giftService: GiftService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a wishlist event' })
  @ApiCreatedResponse({
    description: 'Wishlist event created successfully',
    type: CreatedWishlistEventResponseEnvelopeDto,
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  createWishlistEvent(
    @Body() createWishlistEventDto: CreateWishlistEventDto,
  ): Promise<StandardResopnse<WishlistEvent>> {
    return this.wishlistEventService.createWishlistEvent(
      createWishlistEventDto,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get paginated wishlist events' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'per_page', required: false, example: 25 })
  @ApiQuery({ name: 'searchQuery', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'visibility', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: SortOrder,
    example: SortOrder.DESC,
  })
  @ApiOkResponse({
    description: 'Wishlist events fetched successfully',
    type: PaginatedWishlistEventsResponseEnvelopeDto,
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  findAllWishlistEvents(
    @Query() query: FindWishlistEventsQueryDto,
  ): Promise<StandardResopnse<PaginatedRecordsDto<WishlistEvent>>> {
    return this.wishlistEventService.findAllWishlistEvents(query);
  }

  @Get('created')
  @ApiOperation({
    summary: 'Get paginated wishlist events created by the signed-in user',
  })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'per_page', required: false, example: 25 })
  @ApiQuery({ name: 'searchQuery', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'visibility', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: SortOrder,
    example: SortOrder.DESC,
  })
  @ApiOkResponse({
    description: 'Created wishlist events fetched successfully',
    type: PaginatedWishlistEventsResponseEnvelopeDto,
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  findCreatedWishlistEvents(
    @Query() query: FindWishlistEventsQueryDto,
  ): Promise<StandardResopnse<PaginatedRecordsDto<WishlistEvent>>> {
    return this.wishlistEventService.findCreatedWishlistEvents(query);
  }

  @Get('participated')
  @ApiOperation({
    summary: 'Get paginated wishlist events the signed-in user participates in',
  })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'per_page', required: false, example: 25 })
  @ApiQuery({ name: 'searchQuery', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'visibility', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: SortOrder,
    example: SortOrder.DESC,
  })
  @ApiOkResponse({
    description: 'Participated wishlist events fetched successfully',
    type: PaginatedWishlistEventsResponseEnvelopeDto,
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  findParticipatedWishlistEvents(
    @Query() query: FindWishlistEventsQueryDto,
  ): Promise<StandardResopnse<PaginatedRecordsDto<WishlistEvent>>> {
    return this.wishlistEventService.findParticipatedWishlistEvents(query);
  }

  @Public()
  @Get(':id/gifts')
  @ApiOperation({
    summary: 'Get paginated creator gifts for a wishlist event',
  })
  @ApiParam({ name: 'id', description: 'Wishlist event id' })
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
    description: 'Wishlist event gifts fetched successfully',
    type: PaginatedGiftsResponseEnvelopeDto,
  })
  @ApiNotFoundResponse({ description: 'Wishlist event not found' })
  findWishlistEventGifts(
    @Param('id') id: string,
    @Query() query: FindGiftsQueryDto,
  ): Promise<StandardResopnse<PaginatedRecordsDto<EventGift>>> {
    return this.giftService.findWishlistEventGifts(id, query);
  }

  @Public()
  @Get(':id/gifts/claimed-ids')
  @ApiOperation({
    summary: 'Get claimed gift ids for a wishlist event without pagination',
  })
  @ApiParam({ name: 'id', description: 'Wishlist event id' })
  @ApiOkResponse({
    description: 'Claimed gift ids fetched successfully',
    type: ClaimedGiftIdsResponseEnvelopeDto,
  })
  @ApiNotFoundResponse({ description: 'Wishlist event not found' })
  findWishlistEventClaimedGiftIds(
    @Param('id') id: string,
  ): Promise<StandardResopnse<string[]>> {
    return this.giftService.findClaimedGiftIdsByWishlistEventId(id);
  }

  @Public()
  @Get(':id/public')
  @ApiOperation({
    summary: 'Get public wishlist event details from a shared link',
  })
  @ApiParam({ name: 'id', description: 'Wishlist event id' })
  @ApiOkResponse({
    description: 'Wishlist event fetched successfully',
    type: PublicWishlistEventResponseEnvelopeDto,
  })
  @ApiNotFoundResponse({ description: 'Wishlist event not found' })
  findPublicWishlistEventById(
    @Param('id') id: string,
  ): Promise<StandardResopnse<PublicWishlistEventResponseDto>> {
    return this.wishlistEventService.findPublicWishlistEventById(id);
  }

  @Post(':id/join')
  @ApiOperation({
    summary: 'Join a wishlist event as the signed-in participant',
  })
  @ApiParam({ name: 'id', description: 'Wishlist event id' })
  @ApiCreatedResponse({
    description: 'Wishlist event joined successfully',
    type: CreatedParticipantResponseEnvelopeDto,
  })
  @ApiOkResponse({
    description: 'Wishlist event already joined successfully',
    type: ParticipantResponseEnvelopeDto,
  })
  @ApiNotFoundResponse({ description: 'Wishlist event not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  joinWishlistEvent(
    @Param('id') id: string,
  ): Promise<StandardResopnse<EventParticipant>> {
    return this.wishlistEventService.joinWishlistEvent(id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a wishlist event by wishlist event id' })
  @ApiParam({ name: 'id', description: 'Wishlist event id' })
  @ApiOkResponse({
    description: 'Wishlist event fetched successfully',
    type: WishlistEventResponseEnvelopeDto,
  })
  @ApiNotFoundResponse({ description: 'Wishlist event not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  findWishlistEventById(
    @Param('id') id: string,
  ): Promise<StandardResopnse<WishlistEvent>> {
    return this.wishlistEventService.findWishlistEventById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a wishlist event by wishlist event id' })
  @ApiParam({ name: 'id', description: 'Wishlist event id' })
  @ApiOkResponse({
    description: 'Wishlist event updated successfully',
    type: WishlistEventResponseEnvelopeDto,
  })
  @ApiNotFoundResponse({ description: 'Wishlist event not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  updateWishlistEvent(
    @Param('id') id: string,
    @Body() updateWishlistEventDto: UpdateWishlistEventDto,
  ): Promise<StandardResopnse<WishlistEvent>> {
    return this.wishlistEventService.updateWishlistEvent(
      id,
      updateWishlistEventDto,
    );
  }

  @Patch(':id/complete')
  @ApiOperation({
    summary: 'Complete a wishlist event and move it to ongoing status',
  })
  @ApiParam({ name: 'id', description: 'Wishlist event id' })
  @ApiOkResponse({
    description: 'Wishlist event completed successfully',
    type: WishlistEventResponseEnvelopeDto,
  })
  @ApiNotFoundResponse({ description: 'Wishlist event not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  completeWishlistEvent(
    @Param('id') id: string,
  ): Promise<StandardResopnse<WishlistEvent>> {
    return this.wishlistEventService.completeWishlistEvent(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a wishlist event by wishlist event id' })
  @ApiParam({ name: 'id', description: 'Wishlist event id' })
  @ApiOkResponse({
    description: 'Wishlist event deleted successfully',
    type: WishlistEventDeleteResponseEnvelopeDto,
  })
  @ApiNotFoundResponse({ description: 'Wishlist event not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  deleteWishlistEvent(
    @Param('id') id: string,
  ): Promise<StandardResopnse<DeleteResponseDto>> {
    return this.wishlistEventService.deleteWishlistEvent(id);
  }
}
