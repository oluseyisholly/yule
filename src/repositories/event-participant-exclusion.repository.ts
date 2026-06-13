import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { EventParticipantExclusion } from 'src/entities/event-participant-exclusion.entity';
import { EventParticipant } from 'src/entities/event-participant.entity';
import { BaseRepository } from './base.repository';

export type ParticipantExclusionPair = {
  eventId: string;
  participantOneId: string;
  participantTwoId: string;
  createdById: string;
};

@Injectable()
export class EventParticipantExclusionRepository extends BaseRepository<EventParticipantExclusion> {
  constructor(
    @InjectDataSource() dataSource: DataSource,
    @InjectRepository(EventParticipantExclusion)
    repo: Repository<EventParticipantExclusion>,
  ) {
    super(dataSource, repo);
  }

  async createMany(
    pairs: ParticipantExclusionPair[],
  ): Promise<EventParticipantExclusion[]> {
    if (!pairs.length) {
      return [];
    }

    const existingExclusions = await this.findExistingPairs(pairs);
    const existingKeys = new Set(
      existingExclusions.map((exclusion) =>
        this.createPairKey(
          exclusion.eventId,
          exclusion.participantOneId,
          exclusion.participantTwoId,
        ),
      ),
    );
    const newPairs = pairs.filter(
      (pair) =>
        !existingKeys.has(
          this.createPairKey(
            pair.eventId,
            pair.participantOneId,
            pair.participantTwoId,
          ),
        ),
    );

    const createdExclusions = newPairs.length
      ? await this.repo.save(newPairs.map((pair) => this.repo.create(pair)))
      : [];

    return [...existingExclusions, ...createdExclusions];
  }

  async findByEventForUser(
    eventId: string,
    userId: string,
  ): Promise<EventParticipantExclusion[]> {
    return this.repo
      .createQueryBuilder('exclusion')
      .innerJoinAndSelect('exclusion.event', 'event')
      .select([
        'exclusion.id',
        'exclusion.participantOneId',
        'exclusion.participantTwoId',
        'event.id',
      ])
      .where('exclusion.event_id = :eventId', { eventId })
      .andWhere('event.created_by_id = :userId', { userId })
      .getMany();
  }

  async findByIdForUser(
    id: string,
    userId: string,
  ): Promise<EventParticipantExclusion | null> {
    return this.repo
      .createQueryBuilder('exclusion')
      .innerJoinAndSelect('exclusion.event', 'event')
      .where('exclusion.id = :id', { id })
      .andWhere('event.created_by_id = :userId', { userId })
      .getOne();
  }

  async pairExists(
    eventId: string,
    participantOneId: string,
    participantTwoId: string,
  ): Promise<boolean> {
    return this.repo.exist({
      where: {
        eventId,
        participantOneId,
        participantTwoId,
      },
    });
  }

  async findExcludedPairsForEvent(
    eventId: string,
  ): Promise<EventParticipantExclusion[]> {
    return this.repo.find({
      where: {
        eventId,
      },
    });
  }

  async findParticipantsByIdsForUser(
    participantIds: string[],
    userId: string,
  ): Promise<EventParticipant[]> {
    if (!participantIds.length) {
      return [];
    }

    return this.dataSource
      .getRepository(EventParticipant)
      .createQueryBuilder('participant')
      .innerJoinAndSelect('participant.event', 'event')
      .where('participant.id IN (:...participantIds)', { participantIds })
      .andWhere('event.created_by_id = :userId', { userId })
      .getMany();
  }

  async findPairedParticipantIds(participantIds: string[]): Promise<string[]> {
    if (!participantIds.length) {
      return [];
    }

    const rows = await this.dataSource
      .getRepository(EventParticipant)
      .createQueryBuilder('participant')
      .leftJoin(
        EventParticipant,
        'receiver',
        'receiver.gift_giver_participant_id = participant.id',
      )
      .select('participant.id', 'id')
      .where('participant.id IN (:...participantIds)', { participantIds })
      .andWhere(
        '(participant.gift_giver_participant_id IS NOT NULL OR receiver.id IS NOT NULL)',
      )
      .getRawMany<{ id: string }>();

    return Array.from(new Set(rows.map((row) => row.id)));
  }

  private async findExistingPairs(
    pairs: ParticipantExclusionPair[],
  ): Promise<EventParticipantExclusion[]> {
    const eventIds = Array.from(new Set(pairs.map((pair) => pair.eventId)));
    const participantOneIds = Array.from(
      new Set(pairs.map((pair) => pair.participantOneId)),
    );
    const participantTwoIds = Array.from(
      new Set(pairs.map((pair) => pair.participantTwoId)),
    );

    return this.repo.find({
      where: {
        eventId: In(eventIds),
        participantOneId: In(participantOneIds),
        participantTwoId: In(participantTwoIds),
      },
    });
  }

  private createPairKey(
    eventId: string,
    participantOneId: string,
    participantTwoId: string,
  ) {
    return `${eventId}:${participantOneId}:${participantTwoId}`;
  }
}
