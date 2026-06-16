import {
  BadRequestException,
  ConflictException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { StandardResopnse } from 'src/common';
import { RequestContext } from 'src/common/context/requestContext';
import { DeleteResponseDto, PaginatedRecordsDto } from 'src/dtos/general.dto';
import {
  CreateBulkGiftsDto,
  CreateGiftDto,
  FindParticipantGiftSelectionsQueryDto,
  FindGiftsQueryDto,
  GiftSelectionResponseDto,
  UpdateGiftDto,
} from 'src/dtos/gift.dto';
import { EventGift } from 'src/entities/gift.entity';
import {
  EventParticipant,
  EventParticipantRole,
} from 'src/entities/event-participant.entity';
import { DrawNameEventRepository } from 'src/repositories/draw-name-event.repository';
import { GiftRepository } from 'src/repositories/gift.repository';
import { ParticipantRepository } from 'src/repositories/participant.repository';

@Injectable()
export class GiftService {
  constructor(
    private readonly giftRepository: GiftRepository,
    private readonly participantRepository: ParticipantRepository,
    private readonly drawNameEventRepository: DrawNameEventRepository,
  ) {}

  async createGift(
    createGiftDto: CreateGiftDto,
  ): Promise<StandardResopnse<EventGift>> {
    RequestContext.getCurrentContactId();
    await this.ensureEventBelongsToCurrentUser(createGiftDto.eventId);
    await this.ensureParticipantBelongsToEvent(
      createGiftDto.recipientParticipantId,
      createGiftDto.eventId,
      'Recipient participant not found',
    );
    await this.ensureOptionalParticipantBelongsToEvent(
      createGiftDto.giverParticipantId,
      createGiftDto.eventId,
      'Giver participant not found',
    );

    const gift = await this.giftRepository.create(createGiftDto);

    return {
      code: HttpStatus.CREATED,
      message: 'Gift created successfully',
      data: gift,
    };
  }

  async createBulkGifts(
    createBulkGiftsDto: CreateBulkGiftsDto,
  ): Promise<StandardResopnse<EventGift[]>> {
    RequestContext.getCurrentContactId();
    this.ensureBulkGiftSelectionsAreUnique(createBulkGiftsDto.gifts);
    await this.ensureBulkGiftSelectionsWithinBudget(createBulkGiftsDto);
    // await this.ensureEventBelongsToCurrentUser(createBulkGiftsDto.eventId);
    await this.ensureParticipantBelongsToEvent(
      createBulkGiftsDto.recipientParticipantId,
      createBulkGiftsDto.eventId,
      'Recipient participant not found',
    );
    await this.ensureOptionalParticipantBelongsToEvent(
      createBulkGiftsDto.giverParticipantId,
      createBulkGiftsDto.eventId,
      'Giver participant not found',
    );

    const gifts = await this.giftRepository.replaceParticipantGiftsForEvent(
      createBulkGiftsDto.eventId,
      createBulkGiftsDto.recipientParticipantId,
      createBulkGiftsDto.gifts.map((gift) => ({
        ...gift,
        giverParticipantId: createBulkGiftsDto.giverParticipantId,
      })),
    );

    return {
      code: HttpStatus.CREATED,
      message: 'Gifts created successfully',
      data: gifts,
    };
  }

  async findAllGifts(
    query: FindGiftsQueryDto,
  ): Promise<StandardResopnse<PaginatedRecordsDto<EventGift>>> {
    const currentContactId = RequestContext.getCurrentContactId();
    const paginatedGifts = await this.giftRepository.findAllGifts(
      query,
      currentContactId,
    );

    return {
      code: HttpStatus.OK,
      message: 'Gifts fetched successfully',
      data: paginatedGifts,
    };
  }

  async findSelectedGiftsForEvent(
    eventId: string,
    query: FindGiftsQueryDto,
  ): Promise<StandardResopnse<PaginatedRecordsDto<EventGift>>> {
    const currentContactId = RequestContext.getCurrentContactId();
    // await this.ensureEventBelongsToCurrentUser(eventId);

    const paginatedGifts = await this.giftRepository.findSelectedGiftsForEvent(
      eventId,
      currentContactId,
      query,
    );

    return {
      code: HttpStatus.OK,
      message: 'Event selected gifts fetched successfully',
      data: paginatedGifts,
    };
  }

  async findWishlistEventGifts(
    wishlistEventId: string,
    query: FindGiftsQueryDto,
  ): Promise<StandardResopnse<PaginatedRecordsDto<EventGift>>> {
    const paginatedGifts = await this.giftRepository.findWishlistEventGifts(
      wishlistEventId,
      query,
    );

    return {
      code: HttpStatus.OK,
      message: 'Wishlist event gifts fetched successfully',
      data: paginatedGifts,
    };
  }

  async findClaimedGiftIdsByWishlistEventId(
    wishlistEventId: string,
  ): Promise<StandardResopnse<string[]>> {
    const claimedGiftIds =
      await this.giftRepository.findClaimedGiftIdsByWishlistEventId(
        wishlistEventId,
      );

    return {
      code: HttpStatus.OK,
      message: 'Claimed gift ids fetched successfully',
      data: claimedGiftIds,
    };
  }

  async findMyClaimedGifts(
    query: FindGiftsQueryDto,
  ): Promise<StandardResopnse<PaginatedRecordsDto<EventGift>>> {
    const currentContactId = RequestContext.getCurrentContactId();
    const paginatedGifts = await this.giftRepository.findClaimedGiftsByContact(
      currentContactId,
      query,
    );

    return {
      code: HttpStatus.OK,
      message: 'Claimed gifts fetched successfully',
      data: paginatedGifts,
    };
  }

  async findParticipantGifts(
    participantId: string,
    query: FindGiftsQueryDto,
  ): Promise<StandardResopnse<PaginatedRecordsDto<EventGift>>> {
    const currentContactId = RequestContext.getCurrentContactId();
    const eventId = await this.resolveParticipantGiftEventId(
      participantId,
      query,
    );
    const participantIsReadable =
      await this.giftRepository.participantIsReadableByContact(
        participantId,
        eventId,
        currentContactId,
      );

    if (!participantIsReadable) {
      throw new NotFoundException('Participant not found');
    }

    const paginatedGifts =
      await this.giftRepository.findParticipantGiftsReadableByContact(
        participantId,
        eventId,
        currentContactId,
        query,
      );

    return {
      code: HttpStatus.OK,
      message: 'Participant gifts fetched successfully',
      data: paginatedGifts,
    };
  }

  async findParticipantGiftSelections(
    participantId: string,
    query: FindParticipantGiftSelectionsQueryDto,
  ): Promise<StandardResopnse<GiftSelectionResponseDto[]>> {
    const currentContactId = RequestContext.getCurrentContactId();
    const participantIsReadable =
      await this.giftRepository.participantIsReadableByContact(
        participantId,
        query.eventId,
        currentContactId,
      );

    if (!participantIsReadable) {
      throw new NotFoundException('Participant not found');
    }

    const giftSelections =
      await this.giftRepository.findGiftSelectionsByParticipantId(
        participantId,
        query.eventId,
        currentContactId,
      );

    return {
      code: HttpStatus.OK,
      message: 'Participant gift selections fetched successfully',
      data: giftSelections,
    };
  }

  async findMyGiftRecipientGifts(
    eventId: string,
    query: FindGiftsQueryDto,
  ): Promise<StandardResopnse<PaginatedRecordsDto<EventGift>>> {
    const currentContactId = RequestContext.getCurrentContactId();
    const currentParticipant =
      await this.participantRepository.findByEventIdAndContactId(
        eventId,
        currentContactId,
      );

    if (!currentParticipant) {
      throw new NotFoundException('Participant not found for this event');
    }

    if (!currentParticipant.isPairActive) {
      return {
        code: HttpStatus.OK,
        message: 'Gift recipient gifts fetched successfully',
        data: {
          data: [],
          total: 0,
          page: Number(query.page) || 1,
          pageSize: Number(query.per_page) || 25,
          totalPages: 0,
        },
      };
    }

    const giftRecipient =
      await this.participantRepository.findGiftRecipientForGiver(
        eventId,
        currentParticipant.id,
      );

    if (!giftRecipient) {
      throw new NotFoundException('Gift recipient not found');
    }

    const paginatedGifts =
      await this.giftRepository.findGiftsForAssignedRecipient(
        eventId,
        giftRecipient.id,
        currentParticipant.id,
        query,
      );

    return {
      code: HttpStatus.OK,
      message: 'Gift recipient gifts fetched successfully',
      data: paginatedGifts,
    };
  }

  async findGiftById(id: string): Promise<StandardResopnse<EventGift>> {
    const gift = await this.getGiftOrThrow(id);

    return {
      code: HttpStatus.OK,
      message: 'Gift fetched successfully',
      data: gift,
    };
  }

  async claimGift(id: string): Promise<StandardResopnse<EventGift>> {
    const currentContactId = RequestContext.getCurrentContactId();
    const gift = await this.giftRepository.findGiftByIdWithParticipants(id);

    if (!gift) {
      throw new NotFoundException('Gift not found');
    }

    const currentParticipant = await this.findOrCreateParticipantForGiftClaim(
      gift.eventId,
      currentContactId,
    );

    if (gift.event?.createdById === currentContactId) {
      throw new BadRequestException('You cannot claim your own gift');
    }

    if (gift.recipientParticipantId === currentParticipant.id) {
      throw new BadRequestException('You cannot claim your own gift');
    }

    if (gift.giverParticipantId === currentParticipant.id) {
      return {
        code: HttpStatus.OK,
        message: 'Gift claimed successfully',
        data: gift,
      };
    }

    if (gift.giverParticipantId) {
      throw new ConflictException('Gift has already been claimed');
    }

    const giftWasClaimed = await this.giftRepository.claimGift(
      id,
      currentParticipant.id,
    );

    if (!giftWasClaimed) {
      throw new ConflictException('Gift has already been claimed');
    }

    const claimedGift = await this.giftRepository.findGiftByIdWithParticipants(
      id,
    );

    return {
      code: HttpStatus.OK,
      message: 'Gift claimed successfully',
      data: claimedGift as EventGift,
    };
  }

  private async findOrCreateParticipantForGiftClaim(
    eventId: string,
    currentContactId: string,
  ): Promise<EventParticipant> {
    const existingParticipant =
      await this.participantRepository.findByEventIdAndContactId(
        eventId,
        currentContactId,
      );

    if (existingParticipant) {
      return existingParticipant;
    }

    return this.participantRepository.create({
      eventId,
      eventContactId: currentContactId,
      role: EventParticipantRole.PARTICIPANT,
      isNotified: false,
      isPairActive: false,
    });
  }

  async updateGift(
    id: string,
    updateGiftDto: UpdateGiftDto,
  ): Promise<StandardResopnse<EventGift>> {
    const existingGift = await this.getGiftOrThrow(id);
    const eventId = updateGiftDto.eventId ?? existingGift.eventId;

    if (updateGiftDto.eventId) {
      await this.ensureEventBelongsToCurrentUser(updateGiftDto.eventId);
    }

    if (updateGiftDto.recipientParticipantId) {
      await this.ensureParticipantBelongsToEvent(
        updateGiftDto.recipientParticipantId,
        eventId,
        'Recipient participant not found',
      );
    }

    await this.ensureOptionalParticipantBelongsToEvent(
      updateGiftDto.giverParticipantId,
      eventId,
      'Giver participant not found',
    );

    const updatedGift = await this.giftRepository.update(id, updateGiftDto);

    return {
      code: HttpStatus.OK,
      message: 'Gift updated successfully',
      data: updatedGift,
    };
  }

  async deleteGift(id: string): Promise<StandardResopnse<DeleteResponseDto>> {
    await this.getGiftOrThrow(id);
    await this.giftRepository.delete(id);

    return {
      code: HttpStatus.OK,
      message: 'Gift deleted successfully',
      data: { id },
    };
  }

  private async getGiftOrThrow(id: string): Promise<EventGift> {
    const currentContactId = RequestContext.getCurrentContactId();
    const gift = await this.giftRepository.findByIdForUser(
      id,
      currentContactId,
    );

    if (!gift) {
      throw new NotFoundException('Gift not found');
    }

    return gift;
  }

  private async ensureEventBelongsToCurrentUser(eventId: string) {
    const currentContactId = RequestContext.getCurrentContactId();
    const eventBelongsToUser = await this.giftRepository.eventBelongsToUser(
      eventId,
      currentContactId,
    );

    if (!eventBelongsToUser) {
      throw new NotFoundException('Event not found');
    }
  }

  private async ensureParticipantBelongsToEvent(
    participantId: string,
    eventId: string,
    message: string,
  ) {
    const participantBelongsToEvent =
      await this.giftRepository.participantBelongsToEvent(
        participantId,
        eventId,
      );

    if (!participantBelongsToEvent) {
      throw new NotFoundException(message);
    }
  }

  private async ensureOptionalParticipantBelongsToEvent(
    participantId: string | undefined,
    eventId: string,
    message: string,
  ) {
    if (!participantId) {
      return;
    }

    await this.ensureParticipantBelongsToEvent(participantId, eventId, message);
  }

  private async resolveParticipantGiftEventId(
    participantId: string,
    query: FindGiftsQueryDto,
  ): Promise<string> {
    if (query.eventId) {
      return query.eventId;
    }

    const participant = await this.giftRepository.findParticipantById(
      participantId,
    );

    if (!participant) {
      throw new NotFoundException('Participant not found');
    }

    return participant.eventId;
  }

  private ensureBulkGiftSelectionsAreUnique(
    gifts: CreateBulkGiftsDto['gifts'],
  ) {
    const participantGiftIds = gifts.map((gift) => gift.participantGiftId);
    const uniqueParticipantGiftIds = new Set(participantGiftIds);

    if (participantGiftIds.length !== uniqueParticipantGiftIds.size) {
      throw new BadRequestException(
        'Bulk gifts cannot contain duplicate participantGiftId values',
      );
    }
  }

  private async ensureBulkGiftSelectionsWithinBudget(
    createBulkGiftsDto: CreateBulkGiftsDto,
  ) {
    const budget = await this.drawNameEventRepository.findBudgetByEventId(
      createBulkGiftsDto.eventId,
    );

    if (budget === null) {
      return;
    }

    const totalGiftAmount = createBulkGiftsDto.gifts.reduce(
      (total, gift) => total + Number(gift.amount || 0),
      0,
    );

    if (totalGiftAmount > budget) {
      throw new BadRequestException(
        `Selected gifts total (${totalGiftAmount}) cannot exceed event budget (${budget})`,
      );
    }
  }
}
