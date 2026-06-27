import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { StandardResopnse } from 'src/common';
import { RequestContext } from 'src/common/context/requestContext';
import {
  CreateHangoutEventDetailsDto,
  CreateHangoutEventDto,
  FindHangoutEventsQueryDto,
  UpdateHangoutEventDetailsDto,
  UpdateHangoutEventDto,
} from 'src/dtos/hangout-event.dto';
import { DeleteResponseDto, PaginatedRecordsDto } from 'src/dtos/general.dto';
import { HangoutEvent } from 'src/entities/hangout-event.entity';
import { HangoutEventRepository } from 'src/repositories/hangout-event.repository';

const HANGOUT_EVENT_STATUS = {
  COMPLETED: 'completed',
} as const;

@Injectable()
export class HangoutEventService {
  constructor(
    private readonly hangoutEventRepository: HangoutEventRepository,
  ) {}

  async createHangoutEvent(
    createHangoutEventDto: CreateHangoutEventDto,
  ): Promise<StandardResopnse<HangoutEvent>> {
    RequestContext.getCurrentContactId();

    const hangoutEvent = await this.hangoutEventRepository.createHangoutEvent(
      createHangoutEventDto.event,
      this.toHangoutEventPayload(createHangoutEventDto),
    );

    return {
      code: HttpStatus.CREATED,
      message: 'Hangout event created successfully',
      data: hangoutEvent,
    };
  }

  async findAllHangoutEvents(
    query: FindHangoutEventsQueryDto,
  ): Promise<StandardResopnse<PaginatedRecordsDto<HangoutEvent>>> {
    const currentContactId = RequestContext.getCurrentContactId();
    const paginatedHangoutEvents =
      await this.hangoutEventRepository.findAllHangoutEvents(
        query,
        currentContactId,
      );

    return {
      code: HttpStatus.OK,
      message: 'Hangout events fetched successfully',
      data: paginatedHangoutEvents,
    };
  }

  async findCreatedHangoutEvents(
    query: FindHangoutEventsQueryDto,
  ): Promise<StandardResopnse<PaginatedRecordsDto<HangoutEvent>>> {
    const currentContactId = RequestContext.getCurrentContactId();
    const paginatedHangoutEvents =
      await this.hangoutEventRepository.findCreatedHangoutEvents(
        query,
        currentContactId,
      );

    return {
      code: HttpStatus.OK,
      message: 'Created hangout events fetched successfully',
      data: paginatedHangoutEvents,
    };
  }

  async findParticipatedHangoutEvents(
    query: FindHangoutEventsQueryDto,
  ): Promise<StandardResopnse<PaginatedRecordsDto<HangoutEvent>>> {
    const currentContactId = RequestContext.getCurrentContactId();
    const paginatedHangoutEvents =
      await this.hangoutEventRepository.findParticipatedHangoutEvents(
        query,
        currentContactId,
      );

    return {
      code: HttpStatus.OK,
      message: 'Participated hangout events fetched successfully',
      data: paginatedHangoutEvents,
    };
  }

  async findHangoutEventById(
    eventId: string,
  ): Promise<StandardResopnse<HangoutEvent>> {
    const hangoutEvent = await this.getReadableHangoutEventOrThrow(eventId);

    return {
      code: HttpStatus.OK,
      message: 'Hangout event fetched successfully',
      data: hangoutEvent,
    };
  }

  async updateHangoutEvent(
    eventId: string,
    updateHangoutEventDto: UpdateHangoutEventDto,
  ): Promise<StandardResopnse<HangoutEvent>> {
    const currentContactId = RequestContext.getCurrentContactId();
    const hangoutEvent = await this.getOwnedHangoutEventOrThrow(eventId);

    await this.hangoutEventRepository.updateHangoutEvent(
      hangoutEvent.eventId,
      {
        event: updateHangoutEventDto.event,
        hangoutEvent: this.toOptionalHangoutEventPayload(
          updateHangoutEventDto,
        ),
      },
    );

    const updatedHangoutEvent =
      await this.hangoutEventRepository.findByIdForUser(
        hangoutEvent.eventId,
        currentContactId,
      );

    return {
      code: HttpStatus.OK,
      message: 'Hangout event updated successfully',
      data: updatedHangoutEvent as HangoutEvent,
    };
  }

  async completeHangoutEvent(
    eventId: string,
  ): Promise<StandardResopnse<HangoutEvent>> {
    const currentContactId = RequestContext.getCurrentContactId();
    const hangoutEvent = await this.getOwnedHangoutEventOrThrow(eventId);

    await this.hangoutEventRepository.updateHangoutEvent(
      hangoutEvent.eventId,
      {
        event: {
          status: HANGOUT_EVENT_STATUS.COMPLETED,
        },
      },
    );

    const completedHangoutEvent =
      await this.hangoutEventRepository.findByIdForUser(
        hangoutEvent.eventId,
        currentContactId,
      );

    return {
      code: HttpStatus.OK,
      message: 'Hangout event completed successfully',
      data: completedHangoutEvent as HangoutEvent,
    };
  }

  async deleteHangoutEvent(
    eventId: string,
  ): Promise<StandardResopnse<DeleteResponseDto>> {
    const hangoutEvent = await this.getOwnedHangoutEventOrThrow(eventId);

    await this.hangoutEventRepository.deleteHangoutEvent(
      hangoutEvent.eventId,
    );

    return {
      code: HttpStatus.OK,
      message: 'Hangout event deleted successfully',
      data: { id: eventId },
    };
  }

  private async getReadableHangoutEventOrThrow(
    eventId: string,
  ): Promise<HangoutEvent> {
    const currentContactId = RequestContext.getCurrentContactId();
    const hangoutEvent =
      await this.hangoutEventRepository.findByIdReadableByContact(
        eventId,
        currentContactId,
      );

    if (!hangoutEvent) {
      throw new NotFoundException('Hangout event not found');
    }

    return hangoutEvent;
  }

  private async getOwnedHangoutEventOrThrow(
    eventId: string,
  ): Promise<HangoutEvent> {
    const currentContactId = RequestContext.getCurrentContactId();
    const hangoutEvent = await this.hangoutEventRepository.findByIdForUser(
      eventId,
      currentContactId,
    );

    if (!hangoutEvent) {
      throw new NotFoundException('Hangout event not found');
    }

    return hangoutEvent;
  }

  private toHangoutEventPayload(
    payload: CreateHangoutEventDto | UpdateHangoutEventDto,
  ): CreateHangoutEventDetailsDto | UpdateHangoutEventDetailsDto {
    const {
      location,
      hangoutEventId,
      eventCenterName,
      checkInDate,
      checkOutDate,
      numberOfGuests,
      amount,
      imageUrl,
      maxAttendees,
      allowPlusOne,
    } = payload;

    return {
      location,
      hangoutEventId,
      eventCenterName,
      checkInDate,
      checkOutDate,
      numberOfGuests,
      amount,
      imageUrl,
      maxAttendees,
      allowPlusOne,
    };
  }

  private toOptionalHangoutEventPayload(
    payload: UpdateHangoutEventDto,
  ): UpdateHangoutEventDetailsDto | undefined {
    const hangoutEventPayload = this.toHangoutEventPayload(payload);
    const hasHangoutEventValue = Object.values(hangoutEventPayload).some(
      (value) => value !== undefined,
    );

    return hasHangoutEventValue ? hangoutEventPayload : undefined;
  }
}
