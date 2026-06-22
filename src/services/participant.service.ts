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
  BulkAssignParticipantGiversDto,
  CreateBulkParticipantDto,
  CreateParticipantDto,
  FindMyGiftRecipientQueryDto,
  FindParticipantsQueryDto,
  UpdateMyParticipantByEventDto,
  UpdateParticipantDto,
} from 'src/dtos/participant.dto';
import { EventParticipant } from 'src/entities/event-participant.entity';
import { DrawNameEventRepository } from 'src/repositories/draw-name-event.repository';
import { EventParticipantExclusionRepository } from 'src/repositories/event-participant-exclusion.repository';
import { ParticipantRepository } from 'src/repositories/participant.repository';

@Injectable()
export class ParticipantService {
  constructor(
    private readonly participantRepository: ParticipantRepository,
    private readonly drawNameEventRepository: DrawNameEventRepository,
    private readonly eventParticipantExclusionRepository: EventParticipantExclusionRepository,
  ) {}

  async createParticipant(
    createParticipantDto: CreateParticipantDto,
  ): Promise<StandardResopnse<EventParticipant>> {
    await this.ensureEventBelongsToCurrentUser(createParticipantDto.eventId);
    await this.ensureContactExistsAndConnectToCurrentUser(
      createParticipantDto.contactId,
    );
    await this.ensureParticipantDoesNotExistForContact(
      createParticipantDto.eventId,
      createParticipantDto.contactId,
    );

    const participant = await this.participantRepository.create({
      eventId: createParticipantDto.eventId,
      eventContactId: createParticipantDto.contactId,
      role: createParticipantDto.role,
      isNotified: createParticipantDto.isNotified,
      isPairActive: false,
    });

    return {
      code: HttpStatus.CREATED,
      message: 'Participant created successfully',
      data: participant,
    };
  }

  async createBulkParticipants(
    createBulkParticipantDto: CreateBulkParticipantDto,
  ): Promise<StandardResopnse<EventParticipant[]>> {
    const currentContactId = RequestContext.getCurrentContactId();
    const eventId = await this.resolveBulkParticipantEventId(
      createBulkParticipantDto,
      currentContactId,
    );

    await this.ensureContactsExistAndConnectToCurrentUser(
      createBulkParticipantDto.contactIds,
      currentContactId,
    );
    const hostContactId = currentContactId;
    const participantContactIds = Array.from(
      new Set([...createBulkParticipantDto.contactIds, hostContactId]),
    );

    const participants =
      await this.participantRepository.replaceBulkParticipantsFromContactIds(
        eventId,
        participantContactIds,
        currentContactId,
        createBulkParticipantDto.role,
        hostContactId,
      );

    return {
      code: HttpStatus.CREATED,
      message: 'Participants created successfully',
      data: participants,
    };
  }

  async bulkAssignParticipantGivers(
    bulkAssignParticipantGiversDto: BulkAssignParticipantGiversDto,
  ): Promise<StandardResopnse<EventParticipant[]>> {
    const currentContactId = RequestContext.getCurrentContactId();
    const assignments = bulkAssignParticipantGiversDto.assignments;

    this.ensureBulkAssignmentsAreUnique(assignments);

    const participantIds = Array.from(
      new Set(
        assignments.flatMap((assignment) => [
          assignment.participantId,
          assignment.giftGiverParticipantId,
        ]),
      ),
    );
    const participants =
      await this.participantRepository.findParticipantsForGiverAssignments(
        participantIds,
        currentContactId,
      );
    const participantsById = new Map(
      participants.map((participant) => [participant.id, participant]),
    );

    this.ensureBulkAssignmentParticipantsExist(
      participantIds,
      participantsById,
    );
    this.ensureBulkAssignmentParticipantsAreInSameEvent(
      assignments,
      participantsById,
    );
    await this.ensureBulkAssignmentsAreNotExcluded(
      assignments,
      participantsById,
    );

    const updatedParticipants =
      await this.participantRepository.bulkAssignParticipantGivers(assignments);

    return {
      code: HttpStatus.OK,
      message: 'Participant givers assigned successfully',
      data: updatedParticipants,
    };
  }

  async findAllParticipants(
    query: FindParticipantsQueryDto,
  ): Promise<StandardResopnse<PaginatedRecordsDto<EventParticipant>>> {
    const currentContactId = RequestContext.getCurrentContactId();
    const paginatedParticipants =
      await this.participantRepository.findAllParticipants(
        query,
        currentContactId,
      );

    return {
      code: HttpStatus.OK,
      message: 'Participants fetched successfully',
      data: paginatedParticipants,
    };
  }

  async findParticipantsByDrawNameEventId(
    drawNameEventId: string,
    query: FindParticipantsQueryDto,
  ): Promise<StandardResopnse<PaginatedRecordsDto<EventParticipant>>> {
    const currentContactId = RequestContext.getCurrentContactId();
    const drawNameEvent =
      await this.drawNameEventRepository.findByIdReadableByContact(
        drawNameEventId,
        currentContactId,
      );

    if (!drawNameEvent) {
      throw new NotFoundException('Draw name event not found');
    }

    const paginatedParticipants =
      await this.participantRepository.findAllParticipantsReadableByContact(
        {
          ...query,
          eventId: drawNameEvent.eventId,
        },
        currentContactId,
      );

    return {
      code: HttpStatus.OK,
      message: 'Draw name event participants fetched successfully',
      data: paginatedParticipants,
    };
  }

  async findParticipantContactIdsByDrawNameEventId(
    drawNameEventId: string,
  ): Promise<StandardResopnse<string[]>> {
    const currentContactId = RequestContext.getCurrentContactId();
    const drawNameEvent = await this.drawNameEventRepository.findByIdForUser(
      drawNameEventId,
      currentContactId,
    );

    if (!drawNameEvent) {
      throw new NotFoundException('Draw name event not found');
    }

    const contactIds = await this.participantRepository.findContactIdsByEventId(
      drawNameEvent.eventId,
    );

    return {
      code: HttpStatus.OK,
      message: 'Draw name event participant contact ids fetched successfully',
      data: contactIds,
    };
  }

  async findParticipantById(
    id: string,
  ): Promise<StandardResopnse<EventParticipant>> {
    const participant = await this.getParticipantOrThrow(id);

    return {
      code: HttpStatus.OK,
      message: 'Participant fetched successfully',
      data: participant,
    };
  }

  async findMyParticipantByEventId(
    eventId: string,
  ): Promise<StandardResopnse<EventParticipant>> {
    const currentContactId = RequestContext.getCurrentContactId();
    const participant =
      await this.participantRepository.findByEventIdAndContactId(
        eventId,
        currentContactId,
      );

    if (!participant) {
      throw new NotFoundException('Participant not found for this event');
    }

    return {
      code: HttpStatus.OK,
      message: 'Participant fetched successfully',
      data: participant,
    };
  }

  async findMyGiftRecipient(
    query: FindMyGiftRecipientQueryDto,
  ): Promise<StandardResopnse<EventParticipant | null>> {
    const currentContactId = RequestContext.getCurrentContactId();
    const currentParticipant =
      await this.participantRepository.findByDrawNameEventIdAndContactId(
        query.drawNameEventId,
        currentContactId,
      );

    if (!currentParticipant) {
      throw new NotFoundException(
        'Participant not found for this draw name event',
      );
    }

    if (!currentParticipant.isPairActive) {
      return {
        code: HttpStatus.OK,
        message: 'Gift recipient fetched successfully',
        data: null,
      };
    }

    const giftRecipient =
      await this.participantRepository.findGiftRecipientForGiver(
        currentParticipant.eventId,
        currentParticipant.id,
      );

    return {
      code: HttpStatus.OK,
      message: 'Gift recipient fetched successfully',
      data: giftRecipient,
    };
  }

  async findMyGiftRecipientByEventId(
    eventId: string,
  ): Promise<StandardResopnse<EventParticipant | null>> {
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
        message: 'Gift recipient fetched successfully',
        data: null,
      };
    }

    const giftRecipient =
      await this.participantRepository.findGiftRecipientForGiver(
        currentParticipant.eventId,
        currentParticipant.id,
      );

    return {
      code: HttpStatus.OK,
      message: 'Gift recipient fetched successfully',
      data: giftRecipient,
    };
  }

  async drawMyNameByEventId(
    eventId: string,
  ): Promise<StandardResopnse<EventParticipant | null>> {
    const currentContactId = RequestContext.getCurrentContactId();
    const currentParticipant =
      await this.participantRepository.findByEventIdAndContactId(
        eventId,
        currentContactId,
      );

    if (!currentParticipant) {
      throw new NotFoundException('Participant not found for this event');
    }

    if (!currentParticipant.giftGiverParticipantId) {
      throw new BadRequestException(
        'Draw name has not been assigned for this event',
      );
    }

    await this.participantRepository.update(currentParticipant.id, {
      isPairActive: true,
    });

    const giftRecipient =
      await this.participantRepository.findGiftRecipientForGiver(
        currentParticipant.eventId,
        currentParticipant.id,
      );

    return {
      code: HttpStatus.OK,
      message: 'Draw name fetched successfully',
      data: giftRecipient,
    };
  }

  async updateParticipant(
    id: string,
    updateParticipantDto: UpdateParticipantDto,
  ): Promise<StandardResopnse<EventParticipant>> {
    await this.getParticipantOrThrow(id);

    if (updateParticipantDto.eventId) {
      await this.ensureEventBelongsToCurrentUser(updateParticipantDto.eventId);
    }

    await this.ensureContactExistsAndConnectToCurrentUser(
      updateParticipantDto.contactId,
    );

    const updatedParticipant = await this.participantRepository.update(id, {
      ...(updateParticipantDto.eventId
        ? { eventId: updateParticipantDto.eventId }
        : {}),
      ...(updateParticipantDto.contactId
        ? { eventContactId: updateParticipantDto.contactId }
        : {}),
      ...(updateParticipantDto.role ? { role: updateParticipantDto.role } : {}),
      ...(updateParticipantDto.isNotified !== undefined
        ? { isNotified: updateParticipantDto.isNotified }
        : {}),
      ...(updateParticipantDto.isPairActive !== undefined
        ? { isPairActive: updateParticipantDto.isPairActive }
        : {}),
    });

    return {
      code: HttpStatus.OK,
      message: 'Participant updated successfully',
      data: updatedParticipant,
    };
  }

  async updateMyParticipantByEventId(
    eventId: string,
    updateMyParticipantByEventDto: UpdateMyParticipantByEventDto,
  ): Promise<StandardResopnse<EventParticipant>> {
    const currentContactId = RequestContext.getCurrentContactId();
    const participant =
      await this.participantRepository.findByEventIdAndContactId(
        eventId,
        currentContactId,
      );

    if (!participant) {
      throw new NotFoundException('Participant not found for this event');
    }

    const updatedParticipant = await this.participantRepository.update(
      participant.id,
      {
        ...(updateMyParticipantByEventDto.isNotified !== undefined
          ? { isNotified: updateMyParticipantByEventDto.isNotified }
          : {}),
        ...(updateMyParticipantByEventDto.isPairActive !== undefined
          ? { isPairActive: updateMyParticipantByEventDto.isPairActive }
          : {}),
      },
    );

    return {
      code: HttpStatus.OK,
      message: 'Participant updated successfully',
      data: updatedParticipant,
    };
  }

  async deleteParticipant(
    id: string,
  ): Promise<StandardResopnse<DeleteResponseDto>> {
    await this.getParticipantOrThrow(id);
    await this.participantRepository.delete(id);

    return {
      code: HttpStatus.OK,
      message: 'Participant deleted successfully',
      data: { id },
    };
  }

  private async getParticipantOrThrow(id: string): Promise<EventParticipant> {
    const currentContactId = RequestContext.getCurrentContactId();
    const participant = await this.participantRepository.findByIdForUser(
      id,
      currentContactId,
    );

    if (!participant) {
      throw new NotFoundException('Participant not found');
    }

    return participant;
  }

  private async ensureEventBelongsToCurrentUser(eventId: string) {
    const currentContactId = RequestContext.getCurrentContactId();
    const eventBelongsToUser =
      await this.participantRepository.eventBelongsToUser(
        eventId,
        currentContactId,
      );

    if (!eventBelongsToUser) {
      throw new NotFoundException('Event not found');
    }
  }

  private async resolveBulkParticipantEventId(
    createBulkParticipantDto: CreateBulkParticipantDto,
    currentContactId: string,
  ): Promise<string> {
    if (createBulkParticipantDto.drawNameEventId) {
      const drawNameEvent = await this.drawNameEventRepository.findByIdForUser(
        createBulkParticipantDto.drawNameEventId,
        currentContactId,
      );

      if (!drawNameEvent) {
        throw new NotFoundException('Draw name event not found');
      }

      if (
        createBulkParticipantDto.eventId &&
        createBulkParticipantDto.eventId !== drawNameEvent.eventId
      ) {
        throw new BadRequestException(
          'eventId does not match the supplied drawNameEventId',
        );
      }

      return drawNameEvent.eventId;
    }

    if (!createBulkParticipantDto.eventId) {
      throw new BadRequestException('eventId or drawNameEventId is required');
    }

    await this.ensureEventBelongsToCurrentUser(
      createBulkParticipantDto.eventId,
    );

    return createBulkParticipantDto.eventId;
  }

  private async ensureContactExistsAndConnectToCurrentUser(
    eventContactId?: string,
  ) {
    if (!eventContactId) {
      return;
    }

    const currentContactId = RequestContext.getCurrentContactId();
    await this.ensureContactsExistAndConnectToCurrentUser(
      [eventContactId],
      currentContactId,
    );
  }

  private async ensureContactsExistAndConnectToCurrentUser(
    contactIds: string[],
    ownerContactId: string,
  ) {
    const uniqueContactIds = Array.from(new Set(contactIds));
    const contacts =
      await this.participantRepository.findContactsByIds(uniqueContactIds);
    const foundContactIds = new Set(contacts.map((contact) => contact.id));
    const missingContactIds = uniqueContactIds.filter(
      (contactId) => !foundContactIds.has(contactId),
    );

    if (missingContactIds.length) {
      throw new NotFoundException(
        `Contact not found: ${missingContactIds.join(', ')}`,
      );
    }

    await this.participantRepository.ensureContactConnections(
      ownerContactId,
      uniqueContactIds,
    );
  }

  private async ensureParticipantDoesNotExistForContact(
    eventId: string,
    eventContactId?: string,
  ) {
    if (!eventContactId) {
      return;
    }

    const participantExists =
      await this.participantRepository.participantExistsForEventContact(
        eventId,
        eventContactId,
      );

    if (participantExists) {
      throw new ConflictException(
        'This contact is already a participant for this event',
      );
    }
  }

  private ensureBulkAssignmentsAreUnique(
    assignments: BulkAssignParticipantGiversDto['assignments'],
  ) {
    const participantIds = assignments.map(
      (assignment) => assignment.participantId,
    );
    const uniqueParticipantIds = new Set(participantIds);

    if (participantIds.length !== uniqueParticipantIds.size) {
      throw new BadRequestException(
        'Participant assignments cannot contain duplicate participant ids',
      );
    }

    const hasSelfAssignment = assignments.some(
      (assignment) =>
        assignment.participantId === assignment.giftGiverParticipantId,
    );

    if (hasSelfAssignment) {
      throw new BadRequestException(
        'A participant cannot be assigned as their own gift giver',
      );
    }
  }

  private ensureBulkAssignmentParticipantsExist(
    participantIds: string[],
    participantsById: Map<string, EventParticipant>,
  ) {
    const missingParticipantIds = participantIds.filter(
      (participantId) => !participantsById.has(participantId),
    );

    if (missingParticipantIds.length) {
      throw new NotFoundException(
        `Participant not found: ${missingParticipantIds.join(', ')}`,
      );
    }
  }

  private ensureBulkAssignmentParticipantsAreInSameEvent(
    assignments: BulkAssignParticipantGiversDto['assignments'],
    participantsById: Map<string, EventParticipant>,
  ) {
    assignments.forEach((assignment) => {
      const participant = participantsById.get(assignment.participantId);
      const giftGiverParticipant = participantsById.get(
        assignment.giftGiverParticipantId,
      );

      if (participant?.eventId !== giftGiverParticipant?.eventId) {
        throw new BadRequestException(
          'Participant and gift giver must belong to the same event',
        );
      }
    });
  }

  private async ensureBulkAssignmentsAreNotExcluded(
    assignments: BulkAssignParticipantGiversDto['assignments'],
    participantsById: Map<string, EventParticipant>,
  ) {
    const eventIds = Array.from(
      new Set(
        assignments
          .map((assignment) => participantsById.get(assignment.participantId))
          .filter(Boolean)
          .map((participant) => participant!.eventId),
      ),
    );
    const exclusionsByEventId = await Promise.all(
      eventIds.map(async (eventId) => ({
        eventId,
        exclusions:
          await this.eventParticipantExclusionRepository.findExcludedPairsForEvent(
            eventId,
          ),
      })),
    );
    const excludedPairKeys = new Set(
      exclusionsByEventId.flatMap(({ eventId, exclusions }) =>
        exclusions.map((exclusion) =>
          this.createExclusionPairKey(
            eventId,
            exclusion.participantOneId,
            exclusion.participantTwoId,
          ),
        ),
      ),
    );
    const hasExcludedAssignment = assignments.some((assignment) => {
      const participant = participantsById.get(assignment.participantId);

      if (!participant) {
        return false;
      }

      return excludedPairKeys.has(
        this.createExclusionPairKey(
          participant.eventId,
          assignment.participantId,
          assignment.giftGiverParticipantId,
        ),
      );
    });

    if (hasExcludedAssignment) {
      throw new BadRequestException(
        'One or more participant giver assignments violate exclusion rules',
      );
    }
  }

  private createExclusionPairKey(
    eventId: string,
    participantId: string,
    excludedParticipantId: string,
  ) {
    const [participantOneId, participantTwoId] = [
      participantId,
      excludedParticipantId,
    ].sort();

    return `${eventId}:${participantOneId}:${participantTwoId}`;
  }
}
