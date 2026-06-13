import {
  BadRequestException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { StandardResopnse } from 'src/common';
import { RequestContext } from 'src/common/context/requestContext';
import {
  CreateBulkParticipantExclusionsDto,
  ParticipantExclusionPairResponseDto,
  ParticipantExclusionQueryDto,
} from 'src/dtos/event-participant-exclusion.dto';
import { EventParticipantExclusion } from 'src/entities/event-participant-exclusion.entity';
import { EventParticipant } from 'src/entities/event-participant.entity';
import {
  EventParticipantExclusionRepository,
  ParticipantExclusionPair,
} from 'src/repositories/event-participant-exclusion.repository';

@Injectable()
export class EventParticipantExclusionService {
  constructor(
    private readonly eventParticipantExclusionRepository: EventParticipantExclusionRepository,
  ) {}

  async createBulkParticipantExclusions(
    createBulkParticipantExclusionsDto: CreateBulkParticipantExclusionsDto,
  ): Promise<StandardResopnse<EventParticipantExclusion[]>> {
    const currentContactId = RequestContext.getCurrentContactId();
    const normalizedPairs = this.normalizeExclusionPairs(
      createBulkParticipantExclusionsDto,
    );
    const participantIds = Array.from(
      new Set(
        normalizedPairs.flatMap((pair) => [
          pair.participantOneId,
          pair.participantTwoId,
        ]),
      ),
    );
    const participants =
      await this.eventParticipantExclusionRepository.findParticipantsByIdsForUser(
        participantIds,
        currentContactId,
      );
    const participantsById = new Map(
      participants.map((participant) => [participant.id, participant]),
    );

    this.ensureParticipantsExist(participantIds, participantsById);

    const pairedParticipantIds =
      await this.eventParticipantExclusionRepository.findPairedParticipantIds(
        participantIds,
      );

    this.ensureParticipantsAreNotPaired(pairedParticipantIds);

    const pairs = normalizedPairs.map((pair) => {
      const participantOne = participantsById.get(pair.participantOneId);
      const participantTwo = participantsById.get(pair.participantTwoId);

      if (participantOne?.eventId !== participantTwo?.eventId) {
        throw new BadRequestException(
          'Excluded participants must belong to the same event',
        );
      }

      return {
        eventId: participantOne.eventId,
        participantOneId: pair.participantOneId,
        participantTwoId: pair.participantTwoId,
        createdById: currentContactId,
      };
    });

    const exclusions =
      await this.eventParticipantExclusionRepository.createMany(pairs);

    return {
      code: HttpStatus.CREATED,
      message: 'Participant exclusions created successfully',
      data: exclusions,
    };
  }

  async findParticipantExclusions(
    query: ParticipantExclusionQueryDto,
  ): Promise<StandardResopnse<ParticipantExclusionPairResponseDto[]>> {
    const currentContactId = RequestContext.getCurrentContactId();
    const exclusions =
      await this.eventParticipantExclusionRepository.findByEventForUser(
        query.eventId,
        currentContactId,
      );
    const pairs = exclusions.map((exclusion) => ({
      id: exclusion.id,
      participantIds: [
        exclusion.participantOneId,
        exclusion.participantTwoId,
      ],
    }));

    return {
      code: HttpStatus.OK,
      message: 'Participant exclusions fetched successfully',
      data: pairs,
    };
  }

  async deleteParticipantExclusion(
    id: string,
  ): Promise<StandardResopnse<{ id: string }>> {
    const currentContactId = RequestContext.getCurrentContactId();
    const exclusion =
      await this.eventParticipantExclusionRepository.findByIdForUser(
        id,
        currentContactId,
      );

    if (!exclusion) {
      throw new NotFoundException('Participant exclusion not found');
    }

    await this.eventParticipantExclusionRepository.delete(id, false);

    return {
      code: HttpStatus.OK,
      message: 'Participant exclusion deleted successfully',
      data: { id },
    };
  }

  private normalizeExclusionPairs(
    createBulkParticipantExclusionsDto: CreateBulkParticipantExclusionsDto,
  ): Pick<ParticipantExclusionPair, 'participantOneId' | 'participantTwoId'>[] {
    const seenPairKeys = new Set<string>();

    return createBulkParticipantExclusionsDto.exclusions.map((exclusion) => {
      if (exclusion.participantId === exclusion.excludedParticipantId) {
        throw new BadRequestException(
          'A participant cannot be excluded from themselves',
        );
      }

      const [participantOneId, participantTwoId] = [
        exclusion.participantId,
        exclusion.excludedParticipantId,
      ].sort();
      const pairKey = `${participantOneId}:${participantTwoId}`;

      if (seenPairKeys.has(pairKey)) {
        throw new BadRequestException(
          'Participant exclusion payload contains duplicate pairs',
        );
      }

      seenPairKeys.add(pairKey);

      return {
        participantOneId,
        participantTwoId,
      };
    });
  }

  private ensureParticipantsExist(
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

  private ensureParticipantsAreNotPaired(pairedParticipantIds: string[]) {
    if (pairedParticipantIds.length) {
      throw new BadRequestException(
        `Cannot create exclusions for participants that have already been paired: ${pairedParticipantIds.join(', ')}`,
      );
    }
  }
}
