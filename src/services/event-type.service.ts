import {
  ConflictException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { RequestContext } from 'src/common/context/requestContext';
import { StandardResopnse } from 'src/common';
import {
  CreateEventTypeDto,
  EventTypeDeleteDto,
  EventTypeResponseDto,
  FindEventTypesQueryDto,
  PaginatedEventTypesDto,
  UpdateEventTypeDto,
} from 'src/dtos/event-type.dto';
import { EventType } from 'src/entities/event-type.entity';
import { EventTypeRepository } from 'src/repositories/event-type.repository';

@Injectable()
export class EventTypeService {
  constructor(private readonly eventTypeRepository: EventTypeRepository) {}

  async createEventType(
    createEventTypeDto: CreateEventTypeDto,
  ): Promise<StandardResopnse<EventTypeResponseDto>> {
    const currentUserId = this.getCurrentUserId();
    const normalizedName = this.normalizeName(createEventTypeDto.name);
    const existingEventType =
      await this.eventTypeRepository.findByName(normalizedName);

    if (existingEventType) {
      throw new ConflictException(
        'An event type with this name already exists',
      );
    }

    const eventType = await this.eventTypeRepository.create(
      {
        name: normalizedName,
        description: createEventTypeDto.description?.trim() || null,
        isActive: createEventTypeDto.isActive ?? true,
        createdById: currentUserId,
      },
      false,
    );

    return {
      code: HttpStatus.CREATED,
      message: 'Event type created successfully',
      data: this.toResponse(eventType),
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
      data: {
        ...paginatedEventTypes,
        data: paginatedEventTypes.data.map((eventType) =>
          this.toResponse(eventType),
        ),
      },
    };
  }

  async findAvailableEventTypes(
    query: FindEventTypesQueryDto,
  ): Promise<StandardResopnse<PaginatedEventTypesDto>> {
    const currentUserId = this.getCurrentUserId();
    const paginatedEventTypes =
      await this.eventTypeRepository.findAvailableEventTypes(
        query,
        currentUserId,
      );

    return {
      code: HttpStatus.OK,
      message: 'Available event types fetched successfully',
      data: {
        ...paginatedEventTypes,
        data: paginatedEventTypes.data.map((eventType) =>
          this.toResponse(eventType),
        ),
      },
    };
  }

  async findEventTypeById(
    id: string,
  ): Promise<StandardResopnse<EventTypeResponseDto>> {
    const eventType = await this.getEventTypeOrThrow(id);

    return {
      code: HttpStatus.OK,
      message: 'Event type fetched successfully',
      data: this.toResponse(eventType),
    };
  }

  async updateEventType(
    id: string,
    updateEventTypeDto: UpdateEventTypeDto,
  ): Promise<StandardResopnse<EventTypeResponseDto>> {
    await this.getEventTypeOrThrow(id);

    const patch: Partial<EventType> = {};

    if (updateEventTypeDto.name !== undefined) {
      const normalizedName = this.normalizeName(updateEventTypeDto.name);
      const duplicateEventType = await this.eventTypeRepository.findByName(
        normalizedName,
        id,
      );

      if (duplicateEventType) {
        throw new ConflictException(
          'An event type with this name already exists',
        );
      }

      patch.name = normalizedName;
    }

    if (updateEventTypeDto.description !== undefined) {
      patch.description = updateEventTypeDto.description?.trim() || null;
    }

    if (updateEventTypeDto.isActive !== undefined) {
      patch.isActive = updateEventTypeDto.isActive;
    }

    const updatedEventType = await this.eventTypeRepository.update(id, patch);

    return {
      code: HttpStatus.OK,
      message: 'Event type updated successfully',
      data: this.toResponse(updatedEventType),
    };
  }

  async deleteEventType(
    id: string,
  ): Promise<StandardResopnse<EventTypeDeleteDto>> {
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

  private toResponse(eventType: EventType): EventTypeResponseDto {
    return {
      id: eventType.id,
      name: eventType.name,
      description: eventType.description,
      isActive: eventType.isActive,
      createdAt: eventType.createdAt,
      updatedAt: eventType.updatedAt,
    };
  }

  private normalizeName(name: string): string {
    return name.trim();
  }

  private getCurrentUserId(): string {
    const userId = RequestContext.get('userId');

    if (!userId) {
      throw new UnauthorizedException('Authenticated user id is missing');
    }

    return userId;
  }
}
