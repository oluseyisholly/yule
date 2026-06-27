import {
  BadRequestException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RequestContext } from 'src/common/context/requestContext';
import { StandardResopnse } from 'src/common';
import {
  CreateDrawNameEventDto,
  CreateDrawNameEventDetailsDto,
  FindDrawNameEventsQueryDto,
  UpdateDrawNameEventDto,
  UpdateDrawNameEventDetailsDto,
} from 'src/dtos/draw-name-event.dto';
import { DeleteResponseDto, PaginatedRecordsDto } from 'src/dtos/general.dto';
import { DrawNameEvent } from 'src/entities/draw-name-event.entity';
import { EventParticipantExclusion } from 'src/entities/event-participant-exclusion.entity';
import { EventParticipant } from 'src/entities/event-participant.entity';
import { DrawNameEventRepository } from 'src/repositories/draw-name-event.repository';
import { EventParticipantExclusionRepository } from 'src/repositories/event-participant-exclusion.repository';
import { ParticipantRepository } from 'src/repositories/participant.repository';

type DrawAssignment = {
  participantId: string;
  giftGiverParticipantId: string;
};

const DRAW_NAME_STATUS = {
  DRAFT: 'draft',
  ONGOING: 'ongoing',
  COMPLETED: 'completed',
} as const;

@Injectable()
export class DrawNameEventService {
  constructor(
    private readonly drawNameEventRepository: DrawNameEventRepository,
    private readonly participantRepository: ParticipantRepository,
    private readonly eventParticipantExclusionRepository: EventParticipantExclusionRepository,
  ) {}

  async createDrawNameEvent(
    createDrawNameEventDto: CreateDrawNameEventDto,
  ): Promise<StandardResopnse<DrawNameEvent>> {
    RequestContext.getCurrentContactId();
    const drawNameEvent =
      await this.drawNameEventRepository.createDrawNameEvent(
        createDrawNameEventDto.event,
        this.toDrawNamePayload(createDrawNameEventDto),
      );

    return {
      code: HttpStatus.CREATED,
      message: 'Draw name event created successfully',
      data: drawNameEvent,
    };
  }

  async findAllDrawNameEvents(
    query: FindDrawNameEventsQueryDto,
  ): Promise<StandardResopnse<PaginatedRecordsDto<DrawNameEvent>>> {
    const currentContactId = RequestContext.getCurrentContactId();

    const paginatedDrawNameEvents =
      await this.drawNameEventRepository.findAllDrawNameEvents(
        query,
        currentContactId,
      );

    return {
      code: HttpStatus.OK,
      message: 'Draw name events fetched successfully',
      data: paginatedDrawNameEvents,
    };
  }

  async findCreatedDrawNameEvents(
    query: FindDrawNameEventsQueryDto,
  ): Promise<StandardResopnse<PaginatedRecordsDto<DrawNameEvent>>> {
    const currentContactId = RequestContext.getCurrentContactId();

    const paginatedDrawNameEvents =
      await this.drawNameEventRepository.findCreatedDrawNameEvents(
        query,
        currentContactId,
      );

    return {
      code: HttpStatus.OK,
      message: 'Created draw name events fetched successfully',
      data: paginatedDrawNameEvents,
    };
  }

  async findParticipatedDrawNameEvents(
    query: FindDrawNameEventsQueryDto,
  ): Promise<StandardResopnse<PaginatedRecordsDto<DrawNameEvent>>> {
    const currentContactId = RequestContext.getCurrentContactId();

    const paginatedDrawNameEvents =
      await this.drawNameEventRepository.findParticipatedDrawNameEvents(
        query,
        currentContactId,
      );

    return {
      code: HttpStatus.OK,
      message: 'Participated draw name events fetched successfully',
      data: paginatedDrawNameEvents,
    };
  }

  async drawNames(
    drawNameEventId: string,
  ): Promise<StandardResopnse<EventParticipant[]>> {
    const currentContactId = RequestContext.getCurrentContactId();
    const creatorDrawNameEvent =
      await this.drawNameEventRepository.findByIdForUser(
        drawNameEventId,
        currentContactId,
      );

    if (!creatorDrawNameEvent) {
      return this.activateParticipantPair(drawNameEventId, currentContactId);
    }

    this.ensureDrawNameEventIsDraft(creatorDrawNameEvent);

    const participants =
      await this.participantRepository.findParticipantsForDraw(
        creatorDrawNameEvent.eventId,
        currentContactId,
      );
    const exclusions =
      await this.eventParticipantExclusionRepository.findExcludedPairsForEvent(
        creatorDrawNameEvent.eventId,
      );
    const assignments = this.generateDrawAssignments(
      participants,
      exclusions,
      creatorDrawNameEvent.allowSelfDraw,
    );

    const assignedParticipants =
      await this.participantRepository.replaceDrawAssignments(
        creatorDrawNameEvent.eventId,
        assignments,
      );

    return {
      code: HttpStatus.OK,
      message: 'Draw names assigned successfully',
      data: assignedParticipants,
    };
  }

  private async activateParticipantPair(
    drawNameEventId: string,
    currentContactId: string,
  ): Promise<StandardResopnse<EventParticipant[]>> {
    const drawNameEvent =
      await this.drawNameEventRepository.findByIdReadableByContact(
        drawNameEventId,
        currentContactId,
      );

    if (!drawNameEvent) {
      throw new NotFoundException('Draw name event not found');
    }

    const participant =
      await this.participantRepository.findByEventIdAndContactId(
        drawNameEvent.eventId,
        currentContactId,
      );

    if (!participant) {
      throw new NotFoundException('Participant not found for this event');
    }

    return {
      code: HttpStatus.OK,
      message: 'Participant pair fetched successfully',
      data: [participant],
    };
  }

  async findDrawNameEventById(
    drawNameEventId: string,
  ): Promise<StandardResopnse<DrawNameEvent>> {
    const currentContactId = RequestContext.getCurrentContactId();
    const drawNameEvent =
      await this.drawNameEventRepository.findByIdReadableByContact(
        drawNameEventId,
        currentContactId,
      );

    if (!drawNameEvent) {
      throw new NotFoundException('Draw name event not found');
    }

    return {
      code: HttpStatus.OK,
      message: 'Draw name event fetched successfully',
      data: drawNameEvent,
    };
  }

  async updateDrawNameEvent(
    drawNameEventId: string,
    updateDrawNameEventDto: UpdateDrawNameEventDto,
  ): Promise<StandardResopnse<DrawNameEvent>> {
    const currentContactId = RequestContext.getCurrentContactId();
    const drawNameEvent = await this.getDrawNameEventOrThrow(drawNameEventId);

    this.ensureDrawNameEventIsDraft(drawNameEvent);

    await this.drawNameEventRepository.updateDrawNameEvent(
      drawNameEvent.id,
      drawNameEvent.eventId,
      {
        event: updateDrawNameEventDto.event,
        drawName: this.toOptionalDrawNamePayload(updateDrawNameEventDto),
      },
    );
    const updatedDrawNameEvent =
      await this.drawNameEventRepository.findByIdForUser(
        drawNameEvent.id,
        currentContactId,
      );

    return {
      code: HttpStatus.OK,
      message: 'Draw name event updated successfully',
      data: updatedDrawNameEvent as DrawNameEvent,
    };
  }

  async completeDrawNameEvent(
    drawNameEventId: string,
  ): Promise<StandardResopnse<DrawNameEvent>> {
    const currentContactId = RequestContext.getCurrentContactId();

    // If caller is the creator (owns the draw), allow completing the draw
    const creatorDrawNameEvent =
      await this.drawNameEventRepository.findByIdForUser(
        drawNameEventId,
        currentContactId,
      );

    if (creatorDrawNameEvent) {
      this.ensureDrawNameEventCanBeCompleted(creatorDrawNameEvent);

      const creatorParticipant =
        await this.participantRepository.findByEventIdAndContactId(
          creatorDrawNameEvent.eventId,
          currentContactId,
        );

      if (creatorParticipant) {
        await this.participantRepository.update(creatorParticipant.id, {
          isPairActive: true,
        });
      }

      await this.updateDrawNameCompletionStatus(creatorDrawNameEvent);

      const updatedDrawNameEvent =
        await this.drawNameEventRepository.findByIdForUser(
          creatorDrawNameEvent.id,
          currentContactId,
        );

      return {
        code: HttpStatus.OK,
        message: 'Draw name event completion updated successfully',
        data: updatedDrawNameEvent as DrawNameEvent,
      };
    }

    // If caller is a regular participant, simply activate their pairing
    const drawNameEvent =
      await this.drawNameEventRepository.findByIdReadableByContact(
        drawNameEventId,
        currentContactId,
      );

    if (!drawNameEvent) {
      throw new NotFoundException('Draw name event not found');
    }

    this.ensureDrawNameEventCanBeCompleted(drawNameEvent);

    const participant =
      await this.participantRepository.findByEventIdAndContactId(
        drawNameEvent.eventId,
        currentContactId,
      );

    if (!participant) {
      throw new NotFoundException('Participant not found for this event');
    }

    await this.participantRepository.update(participant.id, {
      isPairActive: true,
    });

    await this.updateDrawNameCompletionStatus(drawNameEvent);

    const updatedDrawNameEvent =
      await this.drawNameEventRepository.findByIdReadableByContact(
        drawNameEvent.id,
        currentContactId,
      );

    return {
      code: HttpStatus.OK,
      message: 'Draw name event completion updated successfully',
      data: updatedDrawNameEvent as DrawNameEvent,
    };
  }

  async deleteDrawNameEvent(
    drawNameEventId: string,
  ): Promise<StandardResopnse<DeleteResponseDto>> {
    const drawNameEvent = await this.getDrawNameEventOrThrow(drawNameEventId);

    // this.ensureDrawNameEventIsDraft(drawNameEvent);

    await this.drawNameEventRepository.deleteDrawNameEvent(
      drawNameEvent.id,
      drawNameEvent.eventId,
    );

    return {
      code: HttpStatus.OK,
      message: 'Draw name event deleted successfully',
      data: { id: drawNameEventId },
    };
  }

  private async getDrawNameEventOrThrow(
    drawNameEventId: string,
  ): Promise<DrawNameEvent> {
    const currentContactId = RequestContext.getCurrentContactId();
    const drawNameEvent = await this.drawNameEventRepository.findByIdForUser(
      drawNameEventId,
      currentContactId,
    );

    if (!drawNameEvent) {
      throw new NotFoundException('Draw name event not found');
    }

    return drawNameEvent;
  }

  private ensureDrawNameEventIsDraft(drawNameEvent: DrawNameEvent) {
    if (drawNameEvent.event?.status?.toLowerCase() !== DRAW_NAME_STATUS.DRAFT) {
      throw new BadRequestException(
        'Draw name event can only be modified while the event is in draft status',
      );
    }
  }

  private ensureDrawNameEventCanBeCompleted(drawNameEvent: DrawNameEvent) {
    const status = drawNameEvent.event?.status?.toLowerCase();

    if (status === DRAW_NAME_STATUS.COMPLETED) {
      throw new BadRequestException('Draw name event is already completed');
    }

    if (![DRAW_NAME_STATUS.DRAFT, DRAW_NAME_STATUS.ONGOING].includes(status as any)) {
      throw new BadRequestException(
        'Draw name event can only be completed from draft or ongoing status',
      );
    }
  }

  private async updateDrawNameCompletionStatus(drawNameEvent: DrawNameEvent) {
    const allParticipantsPairActive =
      await this.participantRepository.allParticipantsPairActive(
        drawNameEvent.eventId,
      );

    await this.drawNameEventRepository.updateDrawNameEvent(
      drawNameEvent.id,
      drawNameEvent.eventId,
      {
        event: {
          status: allParticipantsPairActive
            ? DRAW_NAME_STATUS.COMPLETED
            : DRAW_NAME_STATUS.ONGOING,
        },
        drawName: {
          isDrawCompleted: allParticipantsPairActive,
        },
      },
    );
  }

  private generateDrawAssignments(
    participants: EventParticipant[],
    exclusions: EventParticipantExclusion[],
    allowSelfDraw: boolean,
  ): DrawAssignment[] {
    if (!allowSelfDraw && participants.length < 2) {
      throw new BadRequestException(
        'At least two participants are required to draw names',
      );
    }

    const exclusionKeys = new Set(
      exclusions.map((exclusion) =>
        this.createPairKey(
          exclusion.participantOneId,
          exclusion.participantTwoId,
        ),
      ),
    );
    const shuffledParticipants = this.shuffle(participants);
    const receivers = shuffledParticipants.sort(
      (leftParticipant, rightParticipant) =>
        this.countValidGivers(
          leftParticipant,
          participants,
          exclusionKeys,
          allowSelfDraw,
        ) -
        this.countValidGivers(
          rightParticipant,
          participants,
          exclusionKeys,
          allowSelfDraw,
        ),
    );
    const assignments = new Map<string, string>();
    const usedGiverIds = new Set<string>();
    const drawWasSuccessful = this.assignGivers(
      receivers,
      participants,
      exclusionKeys,
      allowSelfDraw,
      assignments,
      usedGiverIds,
      0,
    );

    if (!drawWasSuccessful) {
      throw new BadRequestException(
        'Unable to generate a valid draw with the current participants and exclusions',
      );
    }

    return participants.map((participant) => ({
      participantId: participant.id,
      giftGiverParticipantId: assignments.get(participant.id)!,
    }));
  }

  private assignGivers(
    receivers: EventParticipant[],
    participants: EventParticipant[],
    exclusionKeys: Set<string>,
    allowSelfDraw: boolean,
    assignments: Map<string, string>,
    usedGiverIds: Set<string>,
    receiverIndex: number,
  ): boolean {
    if (receiverIndex >= receivers.length) {
      return true;
    }

    const receiver = receivers[receiverIndex];
    const candidates = this.shuffle(participants).filter((giver) =>
      this.canAssignGiver(
        receiver,
        giver,
        exclusionKeys,
        allowSelfDraw,
        usedGiverIds,
      ),
    );

    for (const giver of candidates) {
      assignments.set(receiver.id, giver.id);
      usedGiverIds.add(giver.id);

      if (
        this.assignGivers(
          receivers,
          participants,
          exclusionKeys,
          allowSelfDraw,
          assignments,
          usedGiverIds,
          receiverIndex + 1,
        )
      ) {
        return true;
      }

      assignments.delete(receiver.id);
      usedGiverIds.delete(giver.id);
    }

    return false;
  }

  private canAssignGiver(
    receiver: EventParticipant,
    giver: EventParticipant,
    exclusionKeys: Set<string>,
    allowSelfDraw: boolean,
    usedGiverIds: Set<string>,
  ) {
    if (usedGiverIds.has(giver.id)) {
      return false;
    }

    if (!allowSelfDraw && receiver.id === giver.id) {
      return false;
    }

    return !exclusionKeys.has(this.createPairKey(receiver.id, giver.id));
  }

  private countValidGivers(
    receiver: EventParticipant,
    participants: EventParticipant[],
    exclusionKeys: Set<string>,
    allowSelfDraw: boolean,
  ) {
    return participants.filter((giver) =>
      this.canAssignGiver(
        receiver,
        giver,
        exclusionKeys,
        allowSelfDraw,
        new Set(),
      ),
    ).length;
  }

  private shuffle<T>(records: T[]): T[] {
    return [...records].sort(() => Math.random() - 0.5);
  }

  private createPairKey(
    firstParticipantId: string,
    secondParticipantId: string,
  ) {
    return [firstParticipantId, secondParticipantId].sort().join(':');
  }

  private toDrawNamePayload(
    payload: CreateDrawNameEventDto | UpdateDrawNameEventDto,
  ): CreateDrawNameEventDetailsDto | UpdateDrawNameEventDetailsDto {
    const {
      drawDate,
      location,
      maximumSpend,
      budget,
      allowSelfDraw,
      isDrawCompleted,
    } = payload;

    return {
      drawDate,
      location,
      maximumSpend,
      budget,
      allowSelfDraw,
      isDrawCompleted,
    };
  }

  private toOptionalDrawNamePayload(
    payload: UpdateDrawNameEventDto,
  ): UpdateDrawNameEventDetailsDto | undefined {
    const drawNamePayload = this.toDrawNamePayload(payload);
    const hasDrawNameValue = Object.values(drawNamePayload).some(
      (value) => value !== undefined,
    );

    return hasDrawNameValue ? drawNamePayload : undefined;
  }
}
