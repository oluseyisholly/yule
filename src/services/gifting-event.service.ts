import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { StandardResopnse } from 'src/common';
import { RequestContext } from 'src/common/context/requestContext';
import {
  CreateGiftingEventDetailsDto,
  CreateGiftingEventDto,
  FindGiftingEventsQueryDto,
  UpdateGiftingEventDetailsDto,
  UpdateGiftingEventDto,
} from 'src/dtos/gifting-event.dto';
import { DeleteResponseDto, PaginatedRecordsDto } from 'src/dtos/general.dto';
import { GiftingEvent } from 'src/entities/gifting-event.entity';
import { GiftingEventRepository } from 'src/repositories/gifting-event.repository';

const GIFTING_EVENT_STATUS = {
  COMPLETED: 'completed',
} as const;

@Injectable()
export class GiftingEventService {
  constructor(
    private readonly giftingEventRepository: GiftingEventRepository,
  ) {}

  async createGiftingEvent(
    createGiftingEventDto: CreateGiftingEventDto,
  ): Promise<StandardResopnse<GiftingEvent>> {
    RequestContext.getCurrentContactId();

    const giftingEvent = await this.giftingEventRepository.createGiftingEvent(
      createGiftingEventDto.event,
      this.toGiftingEventPayload(createGiftingEventDto),
    );

    return {
      code: HttpStatus.CREATED,
      message: 'Gifting event created successfully',
      data: giftingEvent,
    };
  }

  async findAllGiftingEvents(
    query: FindGiftingEventsQueryDto,
  ): Promise<StandardResopnse<PaginatedRecordsDto<GiftingEvent>>> {
    const currentContactId = RequestContext.getCurrentContactId();
    const paginatedGiftingEvents =
      await this.giftingEventRepository.findAllGiftingEvents(
        query,
        currentContactId,
      );

    return {
      code: HttpStatus.OK,
      message: 'Gifting events fetched successfully',
      data: paginatedGiftingEvents,
    };
  }

  async findGiftingEventById(
    giftingEventId: string,
  ): Promise<StandardResopnse<GiftingEvent>> {
    const giftingEvent = await this.getGiftingEventOrThrow(giftingEventId);

    return {
      code: HttpStatus.OK,
      message: 'Gifting event fetched successfully',
      data: giftingEvent,
    };
  }

  async updateGiftingEvent(
    giftingEventId: string,
    updateGiftingEventDto: UpdateGiftingEventDto,
  ): Promise<StandardResopnse<GiftingEvent>> {
    const currentContactId = RequestContext.getCurrentContactId();
    const giftingEvent = await this.getGiftingEventOrThrow(giftingEventId);

    await this.giftingEventRepository.updateGiftingEvent(
      giftingEvent.id,
      giftingEvent.eventId,
      {
        event: updateGiftingEventDto.event,
        giftingEvent: this.toOptionalGiftingEventPayload(updateGiftingEventDto),
      },
    );

    const updatedGiftingEvent =
      await this.giftingEventRepository.findByIdForUser(
        giftingEvent.id,
        currentContactId,
      );

    return {
      code: HttpStatus.OK,
      message: 'Gifting event updated successfully',
      data: updatedGiftingEvent as GiftingEvent,
    };
  }

  async completeGiftingEvent(
    giftingEventId: string,
  ): Promise<StandardResopnse<GiftingEvent>> {
    const currentContactId = RequestContext.getCurrentContactId();
    const giftingEvent = await this.getGiftingEventOrThrow(giftingEventId);

    await this.giftingEventRepository.updateGiftingEvent(
      giftingEvent.id,
      giftingEvent.eventId,
      {
        event: {
          status: GIFTING_EVENT_STATUS.COMPLETED,
        },
      },
    );

    const completedGiftingEvent =
      await this.giftingEventRepository.findByIdForUser(
        giftingEvent.id,
        currentContactId,
      );

    return {
      code: HttpStatus.OK,
      message: 'Gifting event completed successfully',
      data: completedGiftingEvent as GiftingEvent,
    };
  }

  async deleteGiftingEvent(
    giftingEventId: string,
  ): Promise<StandardResopnse<DeleteResponseDto>> {
    const giftingEvent = await this.getGiftingEventOrThrow(giftingEventId);

    await this.giftingEventRepository.deleteGiftingEvent(
      giftingEvent.id,
      giftingEvent.eventId,
    );

    return {
      code: HttpStatus.OK,
      message: 'Gifting event deleted successfully',
      data: { id: giftingEventId },
    };
  }

  private async getGiftingEventOrThrow(
    giftingEventId: string,
  ): Promise<GiftingEvent> {
    const currentContactId = RequestContext.getCurrentContactId();
    const giftingEvent = await this.giftingEventRepository.findByIdForUser(
      giftingEventId,
      currentContactId,
    );

    if (!giftingEvent) {
      throw new NotFoundException('Gifting event not found');
    }

    return giftingEvent;
  }

  private toGiftingEventPayload(
    payload: CreateGiftingEventDto | UpdateGiftingEventDto,
  ): CreateGiftingEventDetailsDto | UpdateGiftingEventDetailsDto {
    const { giftBudget, currency, giftDeadline, allowAnonymousGifting } =
      payload;

    return {
      giftBudget,
      currency,
      giftDeadline,
      allowAnonymousGifting,
    };
  }

  private toOptionalGiftingEventPayload(
    payload: UpdateGiftingEventDto,
  ): UpdateGiftingEventDetailsDto | undefined {
    const giftingEventPayload = this.toGiftingEventPayload(payload);
    const hasGiftingEventValue = Object.values(giftingEventPayload).some(
      (value) => value !== undefined,
    );

    return hasGiftingEventValue ? giftingEventPayload : undefined;
  }
}
