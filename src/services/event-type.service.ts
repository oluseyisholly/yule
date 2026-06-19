import {
  ConflictException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RequestContext } from 'src/common/context/requestContext';
import { StandardResopnse } from 'src/common';
import { DeleteResponseDto } from 'src/dtos/general.dto';
import {
  CreateEventTypeDto,
  EventTypeResponseDto,
  FindEventTypesQueryDto,
  PaginatedEventTypesDto,
  UpdateEventTypeDto,
} from 'src/dtos/event-type.dto';
import { EventType } from 'src/entities/event-type.entity';
import { EventTypeRepository } from 'src/repositories/event-type.repository';

@Injectable()
export class EventTypeService {
  constructor(
    private readonly eventTypeRepository: EventTypeRepository,
  ) {}

  async createEventType(
    createEventTypeDto: CreateEventTypeDto,
  ): Promise<StandardResopnse<EventTypeResponseDto>> {
    const currentContactId = RequestContext.getCurrentContactId();
    const existingEventType = await this.eventTypeRepository.findByName(
      createEventTypeDto.name,
      currentContactId,
    );

    if (existingEventType) {
      throw new ConflictException(
        'An event type with this name already exists',
      );
    }

    const eventType = await this.eventTypeRepository.create({
      name: createEventTypeDto.name,
      description: createEventTypeDto.description ?? null,
      isActive: createEventTypeDto.isActive ?? true,
    });

    return {
      code: HttpStatus.CREATED,
      message: 'Event type created successfully',
      data: eventType,
    };
  }

  async findAllEventTypes(
    query: FindEventTypesQueryDto,
  ): Promise<StandardResopnse<PaginatedEventTypesDto>> {
    const paginatedEventTypes =
      await this.eventTypeRepository.findAllEventTypes(query);

    return {
      code: HttpStatus.OK,
      message: 'Event types fetched successfully',
      data: paginatedEventTypes,
    };
  }

  async findAvailableEventTypes(
    query: FindEventTypesQueryDto,
  ): Promise<StandardResopnse<PaginatedEventTypesDto>> {
    const currentContactId = RequestContext.getCurrentContactId();
    const paginatedEventTypes =
      await this.eventTypeRepository.findAvailableEventTypes(
        query,
        currentContactId,
      );

    return {
      code: HttpStatus.OK,
      message: 'Available event types fetched successfully',
      data: paginatedEventTypes,
    };
  }

  async findEventTypeById(
    id: string,
  ): Promise<StandardResopnse<EventTypeResponseDto>> {
    const eventType = await this.getEventTypeOrThrow(id);

    return {
      code: HttpStatus.OK,
      message: 'Event type fetched successfully',
      data: eventType,
    };
  }

  async updateEventType(
    id: string,
    updateEventTypeDto: UpdateEventTypeDto,
  ): Promise<StandardResopnse<EventTypeResponseDto>> {
    await this.getEventTypeOrThrow(id);
    await this.ensureEventTypeNameIsUnique(updateEventTypeDto.name, id);

    const updatedEventType = await this.eventTypeRepository.update(
      id,
      updateEventTypeDto,
    );

    return {
      code: HttpStatus.OK,
      message: 'Event type updated successfully',
      data: updatedEventType,
    };
  }

  async deleteEventType(
    id: string,
  ): Promise<StandardResopnse<DeleteResponseDto>> {
    await this.getEventTypeOrThrow(id);
    await this.eventTypeRepository.delete(id);

    return {
      code: HttpStatus.OK,
      message: 'Event type deleted successfully',
      data: { id },
    };
  }

  private async getEventTypeOrThrow(id: string): Promise<EventType> {
    const eventType = await this.eventTypeRepository.findById(id);

    if (!eventType) {
      throw new NotFoundException('Event type not found');
    }

    return eventType;
  }

  private async ensureEventTypeNameIsUnique(name?: string, excludeId?: string) {
    if (name === undefined) {
      return;
    }

    const currentContactId = RequestContext.getCurrentContactId();
    const duplicateEventType = await this.eventTypeRepository.findByName(
      name,
      currentContactId,
      excludeId,
    );

    if (duplicateEventType) {
      throw new ConflictException(
        'An event type with this name already exists',
      );
    }
  }
}
