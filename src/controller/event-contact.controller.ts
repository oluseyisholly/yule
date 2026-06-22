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
import { Gender, SwaggerApiEnumTags } from 'src/common/index.enum';
import {
  CreateEventContactDto,
  CreatedEventContactResponseEnvelopeDto,
  CurrentContactIdResponseEnvelopeDto,
  DeletedEventContactResponseEnvelopeDto,
  EnsuredMeContactResponseEnvelopeDto,
  FindEventContactsQueryDto,
  PaginatedEventContactsResponseEnvelopeDto,
  SyncedEventContactResponseEnvelopeDto,
  SyncEventContactDto,
  UpdatedEventContactResponseEnvelopeDto,
  UpdateEventContactDto,
} from 'src/dtos/event-contact.dto';
import {
  DeleteResponseDto,
  PaginatedRecordsDto,
  SortOrder,
} from 'src/dtos/general.dto';
import { Contact } from 'src/entities/contact.entity';
import { EventContactService } from 'src/services/event-contact.service';

@Controller('contacts')
@ApiTags(SwaggerApiEnumTags.EVENTCONTACT)
@ApiBearerAuth()
export class EventContactController {
  constructor(private readonly eventContactService: EventContactService) {}

  @Post('me/ensure')
  @ApiOperation({ summary: 'Ensure logged-in user exists as a contact' })
  @ApiOkResponse({
    description: 'Logged-in user contact ensured successfully',
    type: EnsuredMeContactResponseEnvelopeDto,
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  ensureCurrentUserContact(): Promise<StandardResopnse<Contact>> {
    return this.eventContactService.ensureCurrentUserContact();
  }

  @Get('me/contact-id')
  @ApiOperation({ summary: 'Get logged-in user contact id' })
  @ApiOkResponse({
    description: 'Current contact id fetched successfully',
    type: CurrentContactIdResponseEnvelopeDto,
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  getCurrentContactId(): Promise<StandardResopnse<{ contactId: string }>> {
    return this.eventContactService.getCurrentContactId();
  }

  @Post('sync')
  @ApiOperation({ summary: 'Sync a contact profile by email' })
  @ApiOkResponse({
    description: 'Event contact synced successfully',
    type: SyncedEventContactResponseEnvelopeDto,
  })
  @ApiConflictResponse({
    description: 'A contact with this phone number already exists',
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  syncEventContact(
    @Body() syncEventContactDto: SyncEventContactDto,
  ): Promise<StandardResopnse<Contact>> {
    return this.eventContactService.syncEventContact(syncEventContactDto);
  }

  @Post()
  @ApiOperation({ summary: 'Create an event contact' })
  @ApiCreatedResponse({
    description: 'Event contact created successfully',
    type: CreatedEventContactResponseEnvelopeDto,
  })
  @ApiConflictResponse({
    description: 'A contact with this email already exists',
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  createEventContact(
    @Body() createEventContactDto: CreateEventContactDto,
  ): Promise<StandardResopnse<Contact>> {
    return this.eventContactService.createEventContact(createEventContactDto);
  }

  @Get('me/contacts')
  @ApiOperation({ summary: 'Get paginated contacts for logged-in user' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'per_page', required: false, example: 25 })
  @ApiQuery({ name: 'searchQuery', required: false })
  @ApiQuery({ name: 'gender', required: false, enum: Gender })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: SortOrder,
    example: SortOrder.DESC,
  })
  @ApiOkResponse({
    description: 'Logged-in user contacts fetched successfully',
    type: PaginatedEventContactsResponseEnvelopeDto,
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  findMyEventContacts(
    @Query() query: FindEventContactsQueryDto,
  ): Promise<StandardResopnse<PaginatedRecordsDto<Contact>>> {
    return this.eventContactService.findMyEventContacts(query);
  }

  @Get('exclude-me')
  @ApiOperation({ summary: 'Get paginated event contacts excluding logged-in user' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'per_page', required: false, example: 25 })
  @ApiQuery({ name: 'searchQuery', required: false })
  @ApiQuery({ name: 'gender', required: false, enum: Gender })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: SortOrder,
    example: SortOrder.DESC,
  })
  @ApiOkResponse({
    description: 'Event contacts fetched successfully',
    type: PaginatedEventContactsResponseEnvelopeDto,
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  findAllEventContactsExcludingMe(
    @Query() query: FindEventContactsQueryDto,
  ): Promise<StandardResopnse<PaginatedRecordsDto<Contact>>> {
    return this.eventContactService.findAllEventContactsExcludingMe(query);
  }

  @Get()
  @ApiOperation({ summary: 'Get paginated event contacts' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'per_page', required: false, example: 25 })
  @ApiQuery({ name: 'searchQuery', required: false })
  @ApiQuery({ name: 'gender', required: false, enum: Gender })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: SortOrder,
    example: SortOrder.DESC,
  })
  @ApiOkResponse({
    description: 'Event contacts fetched successfully',
    type: PaginatedEventContactsResponseEnvelopeDto,
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  findAllEventContacts(
    @Query() query: FindEventContactsQueryDto,
  ): Promise<StandardResopnse<PaginatedRecordsDto<Contact>>> {
    return this.eventContactService.findAllEventContacts(query);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an event contact' })
  @ApiParam({ name: 'id', type: String, description: 'Contact id' })
  @ApiOkResponse({
    description: 'Event contact updated successfully',
    type: UpdatedEventContactResponseEnvelopeDto,
  })
  @ApiConflictResponse({
    description: 'A contact with this phone number already exists',
  })
  @ApiNotFoundResponse({ description: 'Event contact not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  updateEventContact(
    @Param('id') id: string,
    @Body() updateEventContactDto: UpdateEventContactDto,
  ): Promise<StandardResopnse<Contact>> {
    return this.eventContactService.updateEventContact(
      id,
      updateEventContactDto,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an event contact' })
  @ApiParam({ name: 'id', type: String, description: 'Contact id' })
  @ApiOkResponse({
    description: 'Event contact deleted successfully',
    type: DeletedEventContactResponseEnvelopeDto,
  })
  @ApiNotFoundResponse({ description: 'Event contact not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  deleteEventContact(
    @Param('id') id: string,
  ): Promise<StandardResopnse<DeleteResponseDto>> {
    return this.eventContactService.deleteEventContact(id);
  }
}
