import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import {
  Brackets,
  DataSource,
  DeepPartial,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { RequestContext } from 'src/common/context/requestContext';
import { EventOption } from 'src/common/index.enum';
import {
  FindHangoutEventsQueryDto,
  UpdateHangoutEventBaseEventDto,
  UpdateHangoutEventDetailsDto,
} from 'src/dtos/hangout-event.dto';
import { PaginatedRecordsDto } from 'src/dtos/general.dto';
import {
  EventParticipant,
  EventParticipantRole,
} from 'src/entities/event-participant.entity';
import { Event } from 'src/entities/event.entity';
import { HangoutEvent } from 'src/entities/hangout-event.entity';
import { QueryBuilderHelper } from 'src/utils/queryBuilder.utils';

type UpdateHangoutEventRepositoryPayload = {
  event?: UpdateHangoutEventBaseEventDto & { status?: string };
  hangoutEvent?: UpdateHangoutEventDetailsDto;
};

@Injectable()
export class HangoutEventRepository {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    @InjectRepository(HangoutEvent)
    private readonly repo: Repository<HangoutEvent>,
  ) {}

  async createHangoutEvent(
    eventPayload: DeepPartial<Event>,
    hangoutEventPayload: DeepPartial<HangoutEvent>,
  ): Promise<HangoutEvent> {
    const actorId = RequestContext.getActorId();

    return this.dataSource.transaction(async (manager) => {
      const eventRepo = manager.getRepository(Event);
      const hangoutEventRepo = manager.getRepository(HangoutEvent);
      const participantRepo = manager.getRepository(EventParticipant);

      const event = await eventRepo.save(
        eventRepo.create({
          ...eventPayload,
          eventOption: EventOption.HANGOUT,
          createdById: actorId,
        }),
      );

      const hangoutEvent = await hangoutEventRepo.save(
        hangoutEventRepo.create({
          ...hangoutEventPayload,
          eventId: event.id,
        }),
      );

      if (actorId) {
        await participantRepo.save(
          participantRepo.create({
            eventId: event.id,
            eventContactId: actorId,
            role: EventParticipantRole.CREATOR,
            isPairActive: false,
            createdById: actorId,
          }),
        );
      }

      return hangoutEventRepo.findOneOrFail({
        where: { eventId: hangoutEvent.eventId },
        relations: { event: true },
      });
    });
  }

  async findAllHangoutEvents(
    query: FindHangoutEventsQueryDto,
    contactId: string,
  ): Promise<PaginatedRecordsDto<HangoutEvent>> {
    const qb = this.createHangoutEventBaseQuery();
    const helper = this.applyHangoutEventListQueryOptions(qb, query);

    this.applyReadableByContactFilter(qb, contactId);

    return helper.paginate(query);
  }

  async findCreatedHangoutEvents(
    query: FindHangoutEventsQueryDto,
    contactId: string,
  ): Promise<PaginatedRecordsDto<HangoutEvent>> {
    const qb = this.createHangoutEventBaseQuery();
    const helper = this.applyHangoutEventListQueryOptions(qb, query);

    qb.andWhere('event.created_by_id = :contactId', { contactId });

    return helper.paginate(query);
  }

  async findParticipatedHangoutEvents(
    query: FindHangoutEventsQueryDto,
    contactId: string,
  ): Promise<PaginatedRecordsDto<HangoutEvent>> {
    const qb = this.createHangoutEventBaseQuery();
    const helper = this.applyHangoutEventListQueryOptions(qb, query);

    qb.andWhere(`EXISTS ${this.createParticipantAccessSubQuery(qb)}`, {
      contactId,
    })
      .andWhere('event.created_by_id != :contactId', { contactId })
      .andWhere('LOWER(event.status) != :draftStatus', {
        draftStatus: 'draft',
      });

    return helper.paginate(query);
  }

  findByIdReadableByContact(
    eventId: string,
    contactId: string,
  ): Promise<HangoutEvent | null> {
    const qb = this.createHangoutEventBaseQuery().where(
      'hangoutEvent.eventId = :eventId',
      { eventId },
    );

    this.applyReadableByContactFilter(qb, contactId);

    return qb.getOne();
  }

  findByIdForUser(
    eventId: string,
    contactId: string,
  ): Promise<HangoutEvent | null> {
    return this.createHangoutEventBaseQuery()
      .where('hangoutEvent.eventId = :eventId', { eventId })
      .andWhere('event.created_by_id = :contactId', { contactId })
      .getOne();
  }

  async updateHangoutEvent(
    eventId: string,
    payload: UpdateHangoutEventRepositoryPayload,
  ): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const eventRepo = manager.getRepository(Event);
      const hangoutEventRepo = manager.getRepository(HangoutEvent);

      if (payload.event) {
        await eventRepo.update(eventId, payload.event);
      }

      if (payload.hangoutEvent) {
        await hangoutEventRepo.update({ eventId }, payload.hangoutEvent);
      }
    });
  }

  async deleteHangoutEvent(eventId: string): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      await manager.getRepository(HangoutEvent).delete({ eventId });
      await manager.getRepository(Event).softDelete(eventId);
    });
  }

  private createHangoutEventBaseQuery() {
    return this.repo
      .createQueryBuilder('hangoutEvent')
      .innerJoinAndSelect('hangoutEvent.event', 'event')
      .leftJoinAndSelect('event.createdBy', 'createdBy')
      .leftJoinAndSelect('event.participants', 'participant')
      .leftJoinAndSelect('participant.eventContact', 'participantContact')
      .select([
        'hangoutEvent',
        'event.id',
        'event.title',
        'event.description',
        'event.eventTypeId',
        'event.eventOption',
        'event.eventDate',
        'event.status',
        'event.createdAt',
        'createdBy.id',
        'createdBy.firstName',
        'createdBy.lastName',
        'createdBy.email',
        'participant.id',
        'participant.eventId',
        'participant.eventContactId',
        'participant.role',
        'participant.isNotified',
        'participant.isPairActive',
        'participant.giftGiverParticipantId',
        'participantContact.id',
        'participantContact.firstName',
        'participantContact.lastName',
        'participantContact.email',
      ]);
  }

  private applyReadableByContactFilter(
    qb: ReturnType<Repository<HangoutEvent>['createQueryBuilder']>,
    contactId: string,
  ) {
    qb.andWhere(
      new Brackets((subQuery) => {
        subQuery.where('event.created_by_id = :contactId', { contactId });
        subQuery.orWhere(`EXISTS ${this.createParticipantAccessSubQuery(qb)}`, {
          contactId,
        });
      }),
    );
  }

  private applyHangoutEventListQueryOptions(
    qb: SelectQueryBuilder<HangoutEvent>,
    query: FindHangoutEventsQueryDto,
  ): QueryBuilderHelper<HangoutEvent> {
    const helper = new QueryBuilderHelper(qb);

    helper
      .applyFilter({ 'event.status': query.status })
      .applyDateRange('event.eventDate', query.startDate, query.endDate)
      .applySorting('event.createdAt', query.sortOrder);

    if (query.searchQuery) {
      qb.andWhere(
        new Brackets((subQuery) => {
          subQuery.where('event.title ILIKE :searchQuery', {
            searchQuery: `%${query.searchQuery}%`,
          });
          subQuery.orWhere('event.description ILIKE :searchQuery', {
            searchQuery: `%${query.searchQuery}%`,
          });
          subQuery.orWhere('hangoutEvent.location ILIKE :searchQuery', {
            searchQuery: `%${query.searchQuery}%`,
          });
          subQuery.orWhere('hangoutEvent.hangoutEventId ILIKE :searchQuery', {
            searchQuery: `%${query.searchQuery}%`,
          });
          subQuery.orWhere('hangoutEvent.eventCenterName ILIKE :searchQuery', {
            searchQuery: `%${query.searchQuery}%`,
          });
        }),
      );
    }

    return helper;
  }

  private createParticipantAccessSubQuery(
    qb: SelectQueryBuilder<HangoutEvent>,
  ) {
    return qb
      .subQuery()
      .select('1')
      .from(EventParticipant, 'accessParticipant')
      .where('accessParticipant.event_id = event.id')
      .andWhere('accessParticipant.event_contact_id = :contactId')
      .andWhere('accessParticipant.deleted_at IS NULL')
      .getQuery();
  }
}
