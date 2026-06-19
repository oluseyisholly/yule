import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Brackets, DataSource, DeepPartial, Repository } from 'typeorm';
import { RequestContext } from 'src/common/context/requestContext';
import {
  FindGiftingEventsQueryDto,
  UpdateGiftingEventBaseEventDto,
  UpdateGiftingEventDetailsDto,
} from 'src/dtos/gifting-event.dto';
import { PaginatedRecordsDto } from 'src/dtos/general.dto';
import {
  EventParticipant,
  EventParticipantRole,
} from 'src/entities/event-participant.entity';
import { Event } from 'src/entities/event.entity';
import { GiftingEvent } from 'src/entities/gifting-event.entity';
import { QueryBuilderHelper } from 'src/utils/queryBuilder.utils';
import { BaseRepository } from './base.repository';

type UpdateGiftingEventRepositoryPayload = {
  event?: UpdateGiftingEventBaseEventDto & { status?: string };
  giftingEvent?: UpdateGiftingEventDetailsDto;
};

@Injectable()
export class GiftingEventRepository extends BaseRepository<GiftingEvent> {
  constructor(
    @InjectDataSource() dataSource: DataSource,
    @InjectRepository(GiftingEvent) repo: Repository<GiftingEvent>,
  ) {
    super(dataSource, repo);
  }

  async createGiftingEvent(
    eventPayload: DeepPartial<Event>,
    giftingEventPayload: DeepPartial<GiftingEvent>,
  ): Promise<GiftingEvent> {
    const actorId = RequestContext.getActorId();

    return this.dataSource.transaction(async (manager) => {
      const eventRepo = manager.getRepository(Event);
      const giftingEventRepo = manager.getRepository(GiftingEvent);
      const participantRepo = manager.getRepository(EventParticipant);

      const event = await eventRepo.save(
        eventRepo.create({ ...eventPayload, createdById: actorId }),
      );

      const giftingEvent = await giftingEventRepo.save(
        giftingEventRepo.create({
          ...giftingEventPayload,
          eventId: event.id,
          createdById: actorId,
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

      return giftingEventRepo.findOneOrFail({
        where: { id: giftingEvent.id, eventId: event.id },
        relations: { event: true },
      });
    });
  }

  async findAllGiftingEvents(
    query: FindGiftingEventsQueryDto,
    contactId: string,
  ): Promise<PaginatedRecordsDto<GiftingEvent>> {
    const qb = this.createGiftingEventBaseQuery(contactId);
    const helper = new QueryBuilderHelper(qb);

    helper
      .applyFilter({
        'event.status': query.status,
      })
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
        }),
      );
    }

    this.applyCreatedByContactFilter(qb, contactId);

    return helper.paginate(query);
  }

  findByIdForUser(id: string, contactId: string): Promise<GiftingEvent | null> {
    const qb = this.createGiftingEventBaseQuery(contactId).where(
      'giftingEvent.id = :id',
      { id },
    );

    this.applyCreatedByContactFilter(qb, contactId);

    return qb.getOne();
  }

  async updateGiftingEvent(
    giftingEventId: string,
    eventId: string,
    payload: UpdateGiftingEventRepositoryPayload,
  ): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const eventRepo = manager.getRepository(Event);
      const giftingEventRepo = manager.getRepository(GiftingEvent);

      if (payload.event) {
        await eventRepo.update(eventId, payload.event);
      }

      if (payload.giftingEvent) {
        await giftingEventRepo.update(
          { id: giftingEventId, eventId },
          payload.giftingEvent,
        );
      }
    });
  }

  async deleteGiftingEvent(
    giftingEventId: string,
    eventId: string,
  ): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      await manager
        .getRepository(GiftingEvent)
        .softDelete({ id: giftingEventId, eventId });
      await manager.getRepository(Event).softDelete(eventId);
    });
  }

  private createGiftingEventBaseQuery(contactId?: string) {
    return this.repo
      .createQueryBuilder('giftingEvent')
      .innerJoinAndSelect('giftingEvent.event', 'event')
      .leftJoinAndSelect('event.createdBy', 'createdBy')
      .leftJoinAndSelect(
        'event.participants',
        'participant',
        contactId ? 'participant.event_contact_id != :contactId' : undefined,
        contactId ? { contactId } : undefined,
      )
      .leftJoinAndSelect('participant.eventContact', 'participantContact')
      .select([
        'giftingEvent',
        'event.id',
        'event.title',
        'event.description',
        'event.eventTypeId',
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

  private applyCreatedByContactFilter(
    qb: ReturnType<Repository<GiftingEvent>['createQueryBuilder']>,
    contactId: string,
  ) {
    qb.andWhere('event.created_by_id = :contactId', { contactId });
  }
}
