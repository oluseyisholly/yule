import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
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

  async findWishlistEventById(
    wishlistEventId: string,
  ): Promise<StandardResopnse<WishlistEvent>> {
    const wishlistEvent =
      await this.getWishlistEventOrThrow(wishlistEventId);

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

  async deleteWishlistEvent(
    wishlistEventId: string,
  ): Promise<StandardResopnse<DeleteResponseDto>> {
    const wishlistEvent = await this.getWishlistEventOrThrow(wishlistEventId);

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

  private async getWishlistEventOrThrow(
    wishlistEventId: string,
  ): Promise<WishlistEvent> {
    const currentContactId = RequestContext.getCurrentContactId();
    const wishlistEvent =
      await this.wishlistEventRepository.findByIdForUser(
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
