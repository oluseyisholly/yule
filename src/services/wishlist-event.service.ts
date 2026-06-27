import {
  BadRequestException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { StandardResopnse } from 'src/common';
import { RequestContext } from 'src/common/context/requestContext';
import {
  CreateWishlistEventDetailsDto,
  CreateWishlistEventDto,
  FindWishlistEventsQueryDto,
  PublicWishlistEventResponseDto,
  UpdateWishlistEventDetailsDto,
  UpdateWishlistEventDto,
} from 'src/dtos/wishlist-event.dto';
import { DeleteResponseDto, PaginatedRecordsDto } from 'src/dtos/general.dto';
import {
  EventParticipant,
  EventParticipantRole,
} from 'src/entities/event-participant.entity';
import { WishlistEventRepository } from 'src/repositories/wishlist-event.repository';
import { ParticipantRepository } from 'src/repositories/participant.repository';
import { WishlistEvent } from 'src/entities/wishlist-event.entity';

const WISHLIST_EVENT_STATUS = {
  ONGOING: 'ongoing',
  COMPLETED: 'completed',
} as const;

@Injectable()
export class WishlistEventService {
  constructor(
    private readonly wishlistEventRepository: WishlistEventRepository,
    private readonly participantRepository: ParticipantRepository,
  ) {}

  async createWishlistEvent(
    createWishlistEventDto: CreateWishlistEventDto,
  ): Promise<StandardResopnse<WishlistEvent>> {
    RequestContext.getCurrentContactId();

    const wishlistEvent =
      await this.wishlistEventRepository.createWishlistEvent(
        createWishlistEventDto.event,
        this.toWishlistEventPayload(createWishlistEventDto),
      );

    return {
      code: HttpStatus.CREATED,
      message: 'Wishlist event created successfully',
      data: wishlistEvent,
    };
  }

  async findAllWishlistEvents(
    query: FindWishlistEventsQueryDto,
  ): Promise<StandardResopnse<PaginatedRecordsDto<WishlistEvent>>> {
    const currentContactId = RequestContext.getCurrentContactId();

    const paginatedWishlistEvents =
      await this.wishlistEventRepository.findAllWishlistEvents(
        query,
        currentContactId,
      );

    return {
      code: HttpStatus.OK,
      message: 'Wishlist events fetched successfully',
      data: paginatedWishlistEvents,
    };
  }

  async findCreatedWishlistEvents(
    query: FindWishlistEventsQueryDto,
  ): Promise<StandardResopnse<PaginatedRecordsDto<WishlistEvent>>> {
    const currentContactId = RequestContext.getCurrentContactId();

    const paginatedWishlistEvents =
      await this.wishlistEventRepository.findCreatedWishlistEvents(
        query,
        currentContactId,
      );

    return {
      code: HttpStatus.OK,
      message: 'Created wishlist events fetched successfully',
      data: paginatedWishlistEvents,
    };
  }

  async findParticipatedWishlistEvents(
    query: FindWishlistEventsQueryDto,
  ): Promise<StandardResopnse<PaginatedRecordsDto<WishlistEvent>>> {
    const currentContactId = RequestContext.getCurrentContactId();

    const paginatedWishlistEvents =
      await this.wishlistEventRepository.findParticipatedWishlistEvents(
        query,
        currentContactId,
      );

    return {
      code: HttpStatus.OK,
      message: 'Participated wishlist events fetched successfully',
      data: paginatedWishlistEvents,
    };
  }

  async findWishlistEventById(
    wishlistEventId: string,
  ): Promise<StandardResopnse<WishlistEvent>> {
    const wishlistEvent = await this.getWishlistEventOrThrow(wishlistEventId);

    return {
      code: HttpStatus.OK,
      message: 'Wishlist event fetched successfully',
      data: wishlistEvent,
    };
  }

  async findPublicWishlistEventById(
    wishlistEventId: string,
  ): Promise<StandardResopnse<PublicWishlistEventResponseDto>> {
    const wishlistEvent =
      await this.wishlistEventRepository.findByIdUnscoped(wishlistEventId);

    if (!wishlistEvent) {
      throw new NotFoundException('Wishlist event not found');
    }

    return {
      code: HttpStatus.OK,
      message: 'Wishlist event fetched successfully',
      data: this.toPublicWishlistEventResponse(wishlistEvent),
    };
  }

  async joinWishlistEvent(
    wishlistEventId: string,
  ): Promise<StandardResopnse<EventParticipant>> {
    const currentContactId = RequestContext.getCurrentContactId();
    const wishlistEvent =
      await this.wishlistEventRepository.findByIdUnscoped(wishlistEventId);

    if (!wishlistEvent) {
      throw new NotFoundException('Wishlist event not found');
    }

    const existingParticipant =
      await this.participantRepository.findByEventIdAndContactId(
        wishlistEvent.eventId,
        currentContactId,
      );

    if (existingParticipant) {
      return {
        code: HttpStatus.OK,
        message: 'Wishlist event joined successfully',
        data: existingParticipant,
      };
    }

    const participant = await this.participantRepository.create({
      eventId: wishlistEvent.eventId,
      eventContactId: currentContactId,
      role: EventParticipantRole.PARTICIPANT,
      isNotified: false,
      isPairActive: false,
    });

    return {
      code: HttpStatus.CREATED,
      message: 'Wishlist event joined successfully',
      data: participant,
    };
  }

  async updateWishlistEvent(
    wishlistEventId: string,
    updateWishlistEventDto: UpdateWishlistEventDto,
  ): Promise<StandardResopnse<WishlistEvent>> {
    const currentContactId = RequestContext.getCurrentContactId();
    const wishlistEvent = await this.getWishlistEventOrThrow(wishlistEventId);

    await this.wishlistEventRepository.updateWishlistEvent(
      wishlistEvent.id,
      wishlistEvent.eventId,
      {
        event: updateWishlistEventDto.event,
        wishlistEvent: this.toOptionalWishlistEventPayload(
          updateWishlistEventDto,
        ),
      },
    );

    const updatedWishlistEvent =
      await this.wishlistEventRepository.findByIdForUser(
        wishlistEvent.id,
        currentContactId,
      );

    return {
      code: HttpStatus.OK,
      message: 'Wishlist event updated successfully',
      data: updatedWishlistEvent as WishlistEvent,
    };
  }

  async completeWishlistEvent(
    wishlistEventId: string,
  ): Promise<StandardResopnse<WishlistEvent>> {
    const currentContactId = RequestContext.getCurrentContactId();
    const wishlistEvent = await this.getWishlistEventOrThrow(wishlistEventId);

    this.ensureWishlistEventDeadlineHasNotPassed(wishlistEvent);

    await this.wishlistEventRepository.updateWishlistEvent(
      wishlistEvent.id,
      wishlistEvent.eventId,
      {
        event: {
          status: WISHLIST_EVENT_STATUS.ONGOING,
        },
      },
    );

    const updatedWishlistEvent =
      await this.wishlistEventRepository.findByIdForUser(
        wishlistEvent.id,
        currentContactId,
      );

    return {
      code: HttpStatus.OK,
      message: 'Wishlist event completed successfully',
      data: updatedWishlistEvent as WishlistEvent,
    };
  }

  async deleteWishlistEvent(
    wishlistEventId: string,
  ): Promise<StandardResopnse<DeleteResponseDto>> {
    const wishlistEvent = await this.getWishlistEventOrThrow(wishlistEventId);

    this.ensureWishlistEventCanBeDeleted(wishlistEvent);

    await this.wishlistEventRepository.deleteWishlistEvent(
      wishlistEvent.id,
      wishlistEvent.eventId,
    );

    return {
      code: HttpStatus.OK,
      message: 'Wishlist event deleted successfully',
      data: { id: wishlistEventId },
    };
  }

  async completeExpiredOngoingWishlistEvents(): Promise<number> {
    return this.wishlistEventRepository.completeExpiredOngoingWishlistEvents();
  }

  private async getWishlistEventOrThrow(
    wishlistEventId: string,
  ): Promise<WishlistEvent> {
    const currentContactId = RequestContext.getCurrentContactId();
    const wishlistEvent = await this.wishlistEventRepository.findByIdForUser(
      wishlistEventId,
      currentContactId,
    );

    if (!wishlistEvent) {
      throw new NotFoundException('Wishlist event not found');
    }

    return wishlistEvent;
  }

  private toWishlistEventPayload(
    payload: CreateWishlistEventDto | UpdateWishlistEventDto,
  ): CreateWishlistEventDetailsDto | UpdateWishlistEventDetailsDto {
    const { allowMultipleItems, eventDeadline, visibility } = payload;

    return { allowMultipleItems, eventDeadline, visibility };
  }

  private toOptionalWishlistEventPayload(
    payload: UpdateWishlistEventDto,
  ): UpdateWishlistEventDetailsDto | undefined {
    const wishlistEventPayload = this.toWishlistEventPayload(payload);
    const hasWishlistEventValue = Object.values(wishlistEventPayload).some(
      (value) => value !== undefined,
    );

    return hasWishlistEventValue ? wishlistEventPayload : undefined;
  }

  private ensureWishlistEventCanBeDeleted(wishlistEvent: WishlistEvent) {
    if (
      wishlistEvent.event?.status?.toLowerCase() ===
      WISHLIST_EVENT_STATUS.ONGOING
    ) {
      throw new BadRequestException(
        'Wishlist event cannot be deleted while it is ongoing',
      );
    }
  }

  private ensureWishlistEventDeadlineHasNotPassed(
    wishlistEvent: WishlistEvent,
  ) {
    if (!wishlistEvent.eventDeadline) {
      return;
    }

    const deadlineDate = new Date(wishlistEvent.eventDeadline);

    if (Number.isNaN(deadlineDate.getTime())) {
      return;
    }

    if (deadlineDate.getTime() < Date.now()) {
      throw new BadRequestException('The wishlist deadline date has passed');
    }
  }

  private toPublicWishlistEventResponse(
    wishlistEvent: WishlistEvent,
  ): PublicWishlistEventResponseDto {
    return {
      id: wishlistEvent.id,
      eventId: wishlistEvent.eventId,
      title: wishlistEvent.event?.title,
      description: wishlistEvent.event?.description,
      eventDate: wishlistEvent.event?.eventDate,
      visibility: wishlistEvent.visibility,
      allowMultipleItems: wishlistEvent.allowMultipleItems,
      eventDeadline: wishlistEvent.eventDeadline,
      redirectPath: `/dashboard/wishlist-events/${wishlistEvent.id}`,
    };
  }
}
