import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Brackets, DataSource, DeepPartial, Repository } from 'typeorm';
import { RequestContext } from 'src/common/context/requestContext';
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
  event?: UpdateWishlistEventBaseEventDto;
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
        eventRepo.create({ ...eventPayload, createdById: actorId }),
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
    const qb = this.createWishlistEventBaseQuery()
      .where('event.created_by_id = :contactId', { contactId });

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

    return helper.paginate(query);
  }

  findByIdForUser(
    id: string,
    contactId: string,
  ): Promise<WishlistEvent | null> {
    return this.createWishlistEventBaseQuery()
      .where('wishlistEvent.id = :id', { id })
      .andWhere('event.created_by_id = :contactId', { contactId })
      .getOne();
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

  private createWishlistEventBaseQuery() {
    return this.repo
      .createQueryBuilder('wishlistEvent')
      .innerJoinAndSelect('wishlistEvent.event', 'event')
      .leftJoinAndSelect('event.createdBy', 'createdBy')
      .leftJoinAndSelect(
        'event.participants',
        'participant',
        'participant.role != :creatorRole',
        { creatorRole: 'creator' },
      )
      .leftJoinAndSelect('participant.eventContact', 'participantContact')
      .select([
        'wishlistEvent',
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
}
