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
  FindWishlistEventsQueryDto,
  UpdateWishlistEventBaseEventDto,
  UpdateWishlistEventDetailsDto,
} from 'src/dtos/wishlist-event.dto';
import { PaginatedRecordsDto } from 'src/dtos/general.dto';
import {
  EventParticipant,
  EventParticipantRole,
} from 'src/entities/event-participant.entity';
import { Event } from 'src/entities/event.entity';
import { WishlistEvent } from 'src/entities/wishlist-event.entity';
import { QueryBuilderHelper } from 'src/utils/queryBuilder.utils';
import { BaseRepository } from './base.repository';

type UpdateWishlistEventRepositoryPayload = {
  event?: UpdateWishlistEventBaseEventDto & { status?: string };
  wishlistEvent?: UpdateWishlistEventDetailsDto;
};

@Injectable()
export class WishlistEventRepository extends BaseRepository<WishlistEvent> {
  constructor(
    @InjectDataSource() dataSource: DataSource,
    @InjectRepository(WishlistEvent) repo: Repository<WishlistEvent>,
  ) {
    super(dataSource, repo);
  }

  async createWishlistEvent(
    eventPayload: DeepPartial<Event>,
    wishlistEventPayload: DeepPartial<WishlistEvent>,
  ): Promise<WishlistEvent> {
    const actorId = RequestContext.getActorId();

    return this.dataSource.transaction(async (manager) => {
      const eventRepo = manager.getRepository(Event);
      const wishlistEventRepo = manager.getRepository(WishlistEvent);
      const participantRepo = manager.getRepository(EventParticipant);

      const event = await eventRepo.save(
        eventRepo.create({
          ...eventPayload,
          eventOption: EventOption.WISHLIST,
          createdById: actorId,
        }),
      );

      const wishlistEvent = await wishlistEventRepo.save(
        wishlistEventRepo.create({
          ...wishlistEventPayload,
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

      return wishlistEventRepo.findOneOrFail({
        where: { id: wishlistEvent.id, eventId: event.id },
        relations: { event: true },
      });
    });
  }

  async findAllWishlistEvents(
    query: FindWishlistEventsQueryDto,
    contactId: string,
  ): Promise<PaginatedRecordsDto<WishlistEvent>> {
    const qb = this.createWishlistEventBaseQuery(contactId);
    const helper = this.applyWishlistEventListQueryOptions(qb, query);

    this.applyReadableByContactFilter(qb, contactId);

    return helper.paginate(query);
  }

  async findCreatedWishlistEvents(
    query: FindWishlistEventsQueryDto,
    contactId: string,
  ): Promise<PaginatedRecordsDto<WishlistEvent>> {
    const qb = this.createWishlistEventBaseQuery(contactId);
    const helper = this.applyWishlistEventListQueryOptions(qb, query);

    qb.andWhere('event.created_by_id = :contactId', { contactId });

    return helper.paginate(query);
  }

  async findParticipatedWishlistEvents(
    query: FindWishlistEventsQueryDto,
    contactId: string,
  ): Promise<PaginatedRecordsDto<WishlistEvent>> {
    const qb = this.createWishlistEventBaseQuery(contactId);
    const helper = this.applyWishlistEventListQueryOptions(qb, query);

    qb.andWhere(`EXISTS ${this.createParticipantAccessSubQuery(qb)}`, {
      contactId,
    })
      .andWhere('event.created_by_id != :contactId', { contactId })
      .andWhere('LOWER(event.status) != :draftStatus', {
        draftStatus: 'draft',
      });

    return helper.paginate(query);
  }

  findByIdForUser(
    id: string,
    contactId: string,
  ): Promise<WishlistEvent | null> {
    const qb = this.createWishlistEventBaseQuery(contactId).where(
      'wishlistEvent.id = :id',
      { id },
    );

    this.applyReadableByContactFilter(qb, contactId);

    return qb.getOne();
  }

  findByIdUnscoped(id: string): Promise<WishlistEvent | null> {
    return this.createWishlistEventBaseQuery()
      .where('wishlistEvent.id = :id', { id })
      .getOne();
  }

  async updateWishlistEvent(
    wishlistEventId: string,
    eventId: string,
    payload: UpdateWishlistEventRepositoryPayload,
  ): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const eventRepo = manager.getRepository(Event);
      const wishlistEventRepo = manager.getRepository(WishlistEvent);

      if (payload.event) {
        await eventRepo.update(eventId, payload.event);
      }

      if (payload.wishlistEvent) {
        await wishlistEventRepo.update(
          { id: wishlistEventId, eventId },
          payload.wishlistEvent,
        );
      }
    });
  }

  async deleteWishlistEvent(
    wishlistEventId: string,
    eventId: string,
  ): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      await manager
        .getRepository(WishlistEvent)
        .softDelete({ id: wishlistEventId, eventId });
      await manager.getRepository(Event).softDelete(eventId);
    });
  }

  async completeExpiredOngoingWishlistEvents(
    now = new Date(),
  ): Promise<number> {
    const expiredWishlistEvents = await this.repo
      .createQueryBuilder('wishlistEvent')
      .innerJoin('wishlistEvent.event', 'event')
      .select('wishlistEvent.eventId', 'eventId')
      .where('LOWER(event.status) = :ongoingStatus', {
        ongoingStatus: 'ongoing',
      })
      .andWhere('wishlistEvent.eventDeadline IS NOT NULL')
      .andWhere('wishlistEvent.eventDeadline < :now', { now })
      .getRawMany<{ eventId: string }>();

    const eventIds = expiredWishlistEvents.map((event) => event.eventId);

    if (!eventIds.length) {
      return 0;
    }

    const result = await this.dataSource
      .getRepository(Event)
      .createQueryBuilder()
      .update(Event)
      .set({ status: 'completed' })
      .where('id IN (:...eventIds)', { eventIds })
      .execute();

    return result.affected ?? 0;
  }

  private createWishlistEventBaseQuery(contactId?: string) {
    return this.repo
      .createQueryBuilder('wishlistEvent')
      .innerJoinAndSelect('wishlistEvent.event', 'event')
      .leftJoinAndSelect('event.createdBy', 'createdBy')
      .leftJoinAndSelect(
        'event.participants',
        'participant',
        contactId
          ? `
            (
              event.created_by_id = :contactId
              AND participant.event_contact_id != :contactId
            )
            OR (
              event.created_by_id != :contactId
              AND (
                participant.event_contact_id = :contactId
                OR participant.event_contact_id = event.created_by_id
              )
            )
          `
          : undefined,
        contactId ? { contactId } : undefined,
      )
      .leftJoinAndSelect('participant.eventContact', 'participantContact')
      .select([
        'wishlistEvent',
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
        'createdBy.profileUrl',
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
        'participantContact.profileUrl',
      ]);
  }

  private applyReadableByContactFilter(
    qb: ReturnType<Repository<WishlistEvent>['createQueryBuilder']>,
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

  private applyWishlistEventListQueryOptions(
    qb: SelectQueryBuilder<WishlistEvent>,
    query: FindWishlistEventsQueryDto,
  ): QueryBuilderHelper<WishlistEvent> {
    const helper = new QueryBuilderHelper(qb);

    helper
      .applyFilter({
        'event.status': query.status,
        'wishlistEvent.visibility': query.visibility,
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

    return helper;
  }

  private createParticipantAccessSubQuery(
    qb: SelectQueryBuilder<WishlistEvent>,
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
