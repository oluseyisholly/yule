import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
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
  BulkParticipantExclusionsResponseEnvelopeDto,
  CreateBulkParticipantExclusionsDto,
  ParticipantExclusionPairResponseDto,
  ParticipantExclusionQueryDto,
  ParticipantExclusionsResponseEnvelopeDto,
} from 'src/dtos/event-participant-exclusion.dto';
import { DeleteResponseDto } from 'src/dtos/general.dto';
import { EventParticipantExclusion } from 'src/entities/event-participant-exclusion.entity';
import { EventParticipantExclusionService } from 'src/services/event-participant-exclusion.service';

@Controller('participant/exclusion')
@ApiTags(SwaggerApiEnumTags.PARTICIPANT)
@ApiBearerAuth()
export class EventParticipantExclusionController {
  constructor(
    private readonly eventParticipantExclusionService: EventParticipantExclusionService,
  ) {}

  @Post('bulk')
  @ApiOperation({ summary: 'Create participant exclusion pairs in bulk' })
  @ApiCreatedResponse({
    description: 'Participant exclusions created successfully',
    type: BulkParticipantExclusionsResponseEnvelopeDto,
  })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiNotFoundResponse({ description: 'Participant not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  createBulkParticipantExclusions(
    @Body()
    createBulkParticipantExclusionsDto: CreateBulkParticipantExclusionsDto,
  ): Promise<StandardResopnse<EventParticipantExclusion[]>> {
    return this.eventParticipantExclusionService.createBulkParticipantExclusions(
      createBulkParticipantExclusionsDto,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get participant exclusions for an event' })
  @ApiQuery({ name: 'eventId', required: true, type: String })
  @ApiOkResponse({
    description: 'Participant exclusions fetched successfully',
    type: ParticipantExclusionsResponseEnvelopeDto,
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  findParticipantExclusions(
    @Query() query: ParticipantExclusionQueryDto,
  ): Promise<StandardResopnse<ParticipantExclusionPairResponseDto[]>> {
    return this.eventParticipantExclusionService.findParticipantExclusions(
      query,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a participant exclusion' })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ description: 'Participant exclusion deleted successfully' })
  @ApiNotFoundResponse({ description: 'Participant exclusion not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  deleteParticipantExclusion(
    @Param('id') id: string,
  ): Promise<StandardResopnse<DeleteResponseDto>> {
    return this.eventParticipantExclusionService.deleteParticipantExclusion(id);
  }
}
