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
  CreatedGiftingEventResponseEnvelopeDto,
  CreateGiftingEventDto,
  FindGiftingEventsQueryDto,
  GiftingEventDeleteResponseEnvelopeDto,
  GiftingEventResponseEnvelopeDto,
  PaginatedGiftingEventsResponseEnvelopeDto,
  UpdateGiftingEventDto,
} from 'src/dtos/gifting-event.dto';
import {
  DeleteResponseDto,
  PaginatedRecordsDto,
  SortOrder,
} from 'src/dtos/general.dto';
import { GiftingEvent } from 'src/entities/gifting-event.entity';
import { GiftingEventService } from 'src/services/gifting-event.service';

@Controller('gifting-event')
@ApiTags(SwaggerApiEnumTags.GIFTINGEVENT)
@ApiBearerAuth()
export class GiftingEventController {
  constructor(
    private readonly giftingEventService: GiftingEventService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a gifting event' })
  @ApiCreatedResponse({
    description: 'Gifting event created successfully',
    type: CreatedGiftingEventResponseEnvelopeDto,
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  createGiftingEvent(
    @Body() createGiftingEventDto: CreateGiftingEventDto,
  ): Promise<StandardResopnse<GiftingEvent>> {
    return this.giftingEventService.createGiftingEvent(createGiftingEventDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get paginated gifting events' })
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
    description: 'Gifting events fetched successfully',
    type: PaginatedGiftingEventsResponseEnvelopeDto,
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  findAllGiftingEvents(
    @Query() query: FindGiftingEventsQueryDto,
  ): Promise<StandardResopnse<PaginatedRecordsDto<GiftingEvent>>> {
    return this.giftingEventService.findAllGiftingEvents(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a gifting event by gifting event id' })
  @ApiParam({ name: 'id', description: 'Gifting event id' })
  @ApiOkResponse({
    description: 'Gifting event fetched successfully',
    type: GiftingEventResponseEnvelopeDto,
  })
  @ApiNotFoundResponse({ description: 'Gifting event not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  findGiftingEventById(
    @Param('id') id: string,
  ): Promise<StandardResopnse<GiftingEvent>> {
    return this.giftingEventService.findGiftingEventById(id);
  }

  @Patch(':id/complete')
  @ApiOperation({ summary: 'Complete a gifting event by gifting event id' })
  @ApiParam({ name: 'id', description: 'Gifting event id' })
  @ApiOkResponse({
    description: 'Gifting event completed successfully',
    type: GiftingEventResponseEnvelopeDto,
  })
  @ApiNotFoundResponse({ description: 'Gifting event not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  completeGiftingEvent(
    @Param('id') id: string,
  ): Promise<StandardResopnse<GiftingEvent>> {
    return this.giftingEventService.completeGiftingEvent(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a gifting event by gifting event id' })
  @ApiParam({ name: 'id', description: 'Gifting event id' })
  @ApiOkResponse({
    description: 'Gifting event updated successfully',
    type: GiftingEventResponseEnvelopeDto,
  })
  @ApiNotFoundResponse({ description: 'Gifting event not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  updateGiftingEvent(
    @Param('id') id: string,
    @Body() updateGiftingEventDto: UpdateGiftingEventDto,
  ): Promise<StandardResopnse<GiftingEvent>> {
    return this.giftingEventService.updateGiftingEvent(
      id,
      updateGiftingEventDto,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a gifting event by gifting event id' })
  @ApiParam({ name: 'id', description: 'Gifting event id' })
  @ApiOkResponse({
    description: 'Gifting event deleted successfully',
    type: GiftingEventDeleteResponseEnvelopeDto,
  })
  @ApiNotFoundResponse({ description: 'Gifting event not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  deleteGiftingEvent(
    @Param('id') id: string,
  ): Promise<StandardResopnse<DeleteResponseDto>> {
    return this.giftingEventService.deleteGiftingEvent(id);
  }
}
