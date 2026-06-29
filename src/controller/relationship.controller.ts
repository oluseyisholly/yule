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
import { DeleteResponseDto, SortOrder } from 'src/dtos/general.dto';
import {
  CreatedRelationshipResponseEnvelopeDto,
  CreateRelationshipDto,
  FindRelationshipsQueryDto,
  PaginatedRelationshipsDto,
  PaginatedRelationshipsResponseEnvelopeDto,
  RelationshipDeleteResponseEnvelopeDto,
  RelationshipResponseDto,
  RelationshipResponseEnvelopeDto,
  UpdateRelationshipDto,
} from 'src/dtos/relationship.dto';
import { RelationshipService } from 'src/services/relationship.service';

@Controller('relationship')
@ApiTags(SwaggerApiEnumTags.RELATIONSHIP)
@ApiBearerAuth()
export class RelationshipController {
  constructor(private readonly relationshipService: RelationshipService) {}

  @Post()
  @ApiOperation({ summary: 'Create a relationship' })
  @ApiCreatedResponse({ type: CreatedRelationshipResponseEnvelopeDto })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiConflictResponse({
    description: 'A relationship with this name already exists',
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  createRelationship(
    @Body() createRelationshipDto: CreateRelationshipDto,
  ): Promise<StandardResopnse<RelationshipResponseDto>> {
    return this.relationshipService.createRelationship(createRelationshipDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all relationships with pagination' })
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
    example: 'Sibling',
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
  @ApiOkResponse({ type: PaginatedRelationshipsResponseEnvelopeDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  findAllRelationships(
    @Query() query: FindRelationshipsQueryDto,
  ): Promise<StandardResopnse<PaginatedRelationshipsDto>> {
    return this.relationshipService.findAllRelationships(query);
  }

  @Get('available')
  @ApiOperation({
    summary:
      'Get relationships where createdById is null or matches the logged-in user',
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
    example: 'Sibling',
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
  @ApiOkResponse({ type: PaginatedRelationshipsResponseEnvelopeDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  findAvailableRelationships(
    @Query() query: FindRelationshipsQueryDto,
  ): Promise<StandardResopnse<PaginatedRelationshipsDto>> {
    return this.relationshipService.findAvailableRelationships(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a relationship by id' })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ type: RelationshipResponseEnvelopeDto })
  @ApiNotFoundResponse({ description: 'Relationship not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  findRelationshipById(
    @Param('id') id: string,
  ): Promise<StandardResopnse<RelationshipResponseDto>> {
    return this.relationshipService.findRelationshipById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a relationship' })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ type: RelationshipResponseEnvelopeDto })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiConflictResponse({
    description: 'A relationship with this name already exists',
  })
  @ApiNotFoundResponse({ description: 'Relationship not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  updateRelationship(
    @Param('id') id: string,
    @Body() updateRelationshipDto: UpdateRelationshipDto,
  ): Promise<StandardResopnse<RelationshipResponseDto>> {
    return this.relationshipService.updateRelationship(id, updateRelationshipDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a relationship' })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ type: RelationshipDeleteResponseEnvelopeDto })
  @ApiNotFoundResponse({ description: 'Relationship not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  deleteRelationship(
    @Param('id') id: string,
  ): Promise<StandardResopnse<DeleteResponseDto>> {
    return this.relationshipService.deleteRelationship(id);
  }
}
