import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Brackets, DataSource, DeepPartial, IsNull, Repository } from 'typeorm';
import { RequestContext } from 'src/common/context/requestContext';
import { FindGiftsQueryDto } from 'src/dtos/gift.dto';
import { PaginatedRecordsDto } from 'src/dtos/general.dto';
import { Event } from 'src/entities/event.entity';
import { EventGift } from 'src/entities/gift.entity';
import { EventParticipant } from 'src/entities/event-participant.entity';
import { WishlistEvent } from 'src/entities/wishlist-event.entity';
import { QueryBuilderHelper } from 'src/utils/queryBuilder.utils';
import { BaseRepository } from './base.repository';

@Injectable()
export class GiftRepository extends BaseRepository<EventGift> {
  constructor(
    @InjectDataSource() dataSource: DataSource,
    @InjectRepository(EventGift) repo: Repository<EventGift>,
  ) {
    super(dataSource, repo);
  }

  async findAllGifts(
    query: FindGiftsQueryDto,
    userId: string,
  ): Promise<PaginatedRecordsDto<EventGift>> {
    const qb = this.repo
      .createQueryBuilder('gift')
      .innerJoinAndSelect('gift.event', 'event')
      .innerJoinAndSelect('gift.recipientParticipant', 'recipientParticipant')
      .leftJoinAndSelect('gift.giverParticipant', 'giverParticipant')
      .select([
        'gift',
        'event.id',
        'event.title',
        'event.description',
        'event.eventTypeId',
        'event.eventDate',
        'event.status',
        'recipientParticipant',
        'giverParticipant',
      ]);
    const helper = new QueryBuilderHelper(qb);

    helper
      .applyFilter({
        'gift.event_id': query.eventId,
        'gift.recipient_participant_id': query.recipientParticipantId,
        'gift.giver_participant_id': query.giverParticipantId,
      })
      .applyDateRange('gift.createdAt', query.startDate, query.endDate)
      .applySorting('gift.createdAt', query.sortOrder);

    if (query.searchQuery) {
      qb.andWhere(
        new Brackets((subQuery) => {
          subQuery.where('gift.title ILIKE :searchQuery', {
            searchQuery: `%${query.searchQuery}%`,
          });
          subQuery.orWhere('gift.description ILIKE :searchQuery', {
            searchQuery: `%${query.searchQuery}%`,
          });
          subQuery.orWhere('gift.product_slug ILIKE :searchQuery', {
            searchQuery: `%${query.searchQuery}%`,
          });
          subQuery.orWhere('gift.category_slug ILIKE :searchQuery', {
            searchQuery: `%${query.searchQuery}%`,
          });
        }),
      );
    }

    qb.andWhere('event.created_by_id = :userId', { userId });

    return helper.paginate(query);
  }

  async findWishlistEventGifts(
    wishlistEventId: string,
    contactId: string,
    query: FindGiftsQueryDto,
  ): Promise<PaginatedRecordsDto<EventGift>> {
    const qb = this.createGiftBaseQuery()
      .innerJoin(WishlistEvent, 'wishlistEvent', 'wishlistEvent.event_id = event.id')
      .leftJoin(
        EventParticipant,
        'currentParticipant',
        `
          currentParticipant.event_id = gift.event_id
          AND currentParticipant.event_contact_id = :contactId
        `,
      )
      .where('wishlistEvent.id = :wishlistEventId', { wishlistEventId })
      .andWhere('recipientParticipant.event_contact_id = event.created_by_id')
      .andWhere(
        new Brackets((subQuery) => {
          subQuery.where('event.created_by_id = :contactId', { contactId });
          subQuery.orWhere('currentParticipant.id IS NOT NULL');
        }),
      );
    const helper = new QueryBuilderHelper(qb);

    helper
      .applyDateRange('gift.createdAt', query.startDate, query.endDate)
      .applySorting('gift.createdAt', query.sortOrder);

    this.applyGiftSearch(qb, query.searchQuery);

    return helper.paginate(query);
  }

  async findParticipantGiftsReadableByContact(
    participantId: string,
    eventId: string,
    contactId: string,
    query: FindGiftsQueryDto,
  ): Promise<PaginatedRecordsDto<EventGift>> {
    const qb = this.repo
      .createQueryBuilder('gift')
      .innerJoinAndSelect('gift.event', 'event')
      .innerJoinAndSelect('gift.recipientParticipant', 'recipientParticipant')
      .leftJoinAndSelect('gift.giverParticipant', 'giverParticipant')
      .leftJoin(
        EventParticipant,
        'currentParticipant',
        `
          currentParticipant.event_id = gift.event_id
          AND currentParticipant.event_contact_id = :contactId
        `,
      )
      .select([
        'gift',
        'event.id',
        'event.title',
        'event.description',
        'event.eventTypeId',
        'event.eventDate',
        'event.status',
        'recipientParticipant',
        'giverParticipant',
      ])
      .where('gift.event_id = :eventId', { eventId })
      .andWhere('gift.recipient_participant_id = :participantId', {
        participantId,
      })
      .andWhere(
        new Brackets((subQuery) => {
          subQuery.where('event.created_by_id = :contactId', { contactId });
          subQuery.orWhere(
            'recipientParticipant.event_contact_id = :contactId',
            {
              contactId,
            },
          );
          subQuery.orWhere(
            'recipientParticipant.gift_giver_participant_id = currentParticipant.id',
          );
        }),
      );
    const helper = new QueryBuilderHelper(qb);

    helper
      .applyDateRange('gift.createdAt', query.startDate, query.endDate)
      .applySorting('gift.createdAt', query.sortOrder);

    if (query.searchQuery) {
      qb.andWhere(
        new Brackets((subQuery) => {
          subQuery.where('gift.title ILIKE :searchQuery', {
            searchQuery: `%${query.searchQuery}%`,
          });
          subQuery.orWhere('gift.description ILIKE :searchQuery', {
            searchQuery: `%${query.searchQuery}%`,
          });
          subQuery.orWhere('gift.product_slug ILIKE :searchQuery', {
            searchQuery: `%${query.searchQuery}%`,
          });
          subQuery.orWhere('gift.category_slug ILIKE :searchQuery', {
            searchQuery: `%${query.searchQuery}%`,
          });
        }),
      );
    }

    return helper.paginate(query);
  }

  async findGiftByIdWithParticipants(id: string): Promise<EventGift | null> {
    return this.createGiftBaseQuery().where('gift.id = :id', { id }).getOne();
  }

  async claimGift(
    giftId: string,
    giverParticipantId: string,
  ): Promise<boolean> {
    const result = await this.repo.update(
      {
        id: giftId,
        giverParticipantId: IsNull(),
      },
      {
        giverParticipantId,
      },
    );

    return Boolean(result.affected);
  }

  async findClaimedGiftsByContact(
    contactId: string,
    query: FindGiftsQueryDto,
  ): Promise<PaginatedRecordsDto<EventGift>> {
    const qb = this.createGiftBaseQuery()
      .where('giverParticipant.event_contact_id = :contactId', { contactId });
    const helper = new QueryBuilderHelper(qb);

    helper
      .applyFilter({
        'gift.event_id': query.eventId,
        'gift.recipient_participant_id': query.recipientParticipantId,
      })
      .applyDateRange('gift.createdAt', query.startDate, query.endDate)
      .applySorting('gift.createdAt', query.sortOrder);

    this.applyGiftSearch(qb, query.searchQuery);

    return helper.paginate(query);
  }

  async findByIdForUser(id: string, userId: string): Promise<EventGift | null> {
    return this.repo
      .createQueryBuilder('gift')
      .innerJoinAndSelect('gift.event', 'event')
      .innerJoinAndSelect('gift.recipientParticipant', 'recipientParticipant')
      .leftJoinAndSelect('gift.giverParticipant', 'giverParticipant')
      .select([
        'gift',
        'event.id',
        'event.title',
        'event.description',
        'event.eventTypeId',
        'event.eventDate',
        'event.status',
        'recipientParticipant',
        'giverParticipant',
      ])
      .where('gift.id = :id', { id })
      .andWhere('event.created_by_id = :userId', { userId })
      .getOne();
  }

  async createManyGifts(gifts: DeepPartial<EventGift>[]): Promise<EventGift[]> {
    const actorId = RequestContext.getActorId();
    const giftEntities = gifts.map((gift) =>
      this.repo.create({ ...gift, createdById: actorId }),
    );

    return this.repo.save(giftEntities);
  }

  async replaceParticipantGiftsForEvent(
    eventId: string,
    recipientParticipantId: string,
    gifts: DeepPartial<EventGift>[],
  ): Promise<EventGift[]> {
    const actorId = RequestContext.getActorId();

    return this.dataSource.transaction(async (manager) => {
      const giftRepo = manager.getRepository(EventGift);

      await giftRepo.delete({
        eventId,
        recipientParticipantId,
      });

      const giftEntities = gifts.map((gift) =>
        giftRepo.create({
          ...gift,
          eventId,
          recipientParticipantId,
          createdById: actorId,
        }),
      );

      return giftRepo.save(giftEntities);
    });
  }

  async eventBelongsToUser(eventId: string, userId: string): Promise<boolean> {
    return this.dataSource.getRepository(Event).exist({
      where: {
        id: eventId,
        createdById: userId,
      },
    });
  }

  async participantBelongsToEvent(
    participantId: string,
    eventId: string,
  ): Promise<boolean> {
    return this.dataSource.getRepository(EventParticipant).exist({
      where: {
        id: participantId,
        eventId,
      },
    });
  }

  async findParticipantById(
    participantId: string,
  ): Promise<EventParticipant | null> {
    return this.dataSource.getRepository(EventParticipant).findOne({
      where: {
        id: participantId,
      },
    });
  }

  async participantBelongsToUserEvent(
    participantId: string,
    userId: string,
  ): Promise<boolean> {
    const participantCount = await this.dataSource
      .getRepository(EventParticipant)
      .createQueryBuilder('participant')
      .innerJoin('participant.event', 'event')
      .where('participant.id = :participantId', { participantId })
      .andWhere('event.created_by_id = :userId', { userId })
      .getCount();

    return participantCount > 0;
  }

  async participantIsReadableByContact(
    participantId: string,
    eventId: string,
    contactId: string,
  ): Promise<boolean> {
    const participantCount = await this.dataSource
      .getRepository(EventParticipant)
      .createQueryBuilder('participant')
      .innerJoin('participant.event', 'event')
      .leftJoin(
        EventParticipant,
        'currentParticipant',
        `
          currentParticipant.event_id = participant.event_id
          AND currentParticipant.event_contact_id = :contactId
        `,
      )
      .where('participant.id = :participantId', { participantId })
      .andWhere('participant.event_id = :eventId', { eventId })
      .andWhere(
        new Brackets((subQuery) => {
          subQuery.where('event.created_by_id = :contactId', { contactId });
          subQuery.orWhere('participant.event_contact_id = :contactId', {
            contactId,
          });
          subQuery.orWhere(
            'participant.gift_giver_participant_id = currentParticipant.id',
          );
        }),
      )
      .getCount();

    return participantCount > 0;
  }

  async findGiftSelectionsByParticipantId(
    participantId: string,
    eventId: string,
    contactId: string,
  ): Promise<Array<{ id: string; participantGiftId: string }>> {
    const gifts = await this.repo
      .createQueryBuilder('gift')
      .innerJoin('gift.event', 'event')
      .innerJoin('gift.recipientParticipant', 'recipientParticipant')
      .leftJoin(
        EventParticipant,
        'currentParticipant',
        `
          currentParticipant.event_id = gift.event_id
          AND currentParticipant.event_contact_id = :contactId
        `,
      )
      .select(['gift.id', 'gift.participantGiftId'])
      .where('gift.recipient_participant_id = :participantId', {
        participantId,
      })
      .andWhere('gift.event_id = :eventId', { eventId })
      .andWhere(
        new Brackets((subQuery) => {
          subQuery.where('event.created_by_id = :contactId', { contactId });
          subQuery.orWhere(
            'recipientParticipant.event_contact_id = :contactId',
            {
              contactId,
            },
          );
          subQuery.orWhere(
            'recipientParticipant.gift_giver_participant_id = currentParticipant.id',
          );
        }),
      )
      .orderBy('gift.createdAt', 'DESC')
      .getMany();

    return gifts.map((gift) => ({
      id: gift.id,
      participantGiftId: gift.participantGiftId,
    }));
  }

  async findGiftsForAssignedRecipient(
    eventId: string,
    recipientParticipantId: string,
    giverParticipantId: string,
    query: FindGiftsQueryDto,
  ): Promise<PaginatedRecordsDto<EventGift>> {
    const qb = this.repo
      .createQueryBuilder('gift')
      .innerJoinAndSelect('gift.event', 'event')
      .innerJoinAndSelect('gift.recipientParticipant', 'recipientParticipant')
      .leftJoinAndSelect('gift.giverParticipant', 'giverParticipant')
      .select([
        'gift',
        'event.id',
        'event.title',
        'event.description',
        'event.eventTypeId',
        'event.eventDate',
        'event.status',
        'recipientParticipant',
        'giverParticipant',
      ])
      .where('gift.event_id = :eventId', { eventId })
      .andWhere('gift.recipient_participant_id = :recipientParticipantId', {
        recipientParticipantId,
      })
      .andWhere(
        'recipientParticipant.gift_giver_participant_id = :giverParticipantId',
        { giverParticipantId },
      );
    const helper = new QueryBuilderHelper(qb);

    helper
      .applyDateRange('gift.createdAt', query.startDate, query.endDate)
      .applySorting('gift.createdAt', query.sortOrder);

    if (query.searchQuery) {
      qb.andWhere(
        new Brackets((subQuery) => {
          subQuery.where('gift.title ILIKE :searchQuery', {
            searchQuery: `%${query.searchQuery}%`,
          });
          subQuery.orWhere('gift.description ILIKE :searchQuery', {
            searchQuery: `%${query.searchQuery}%`,
          });
          subQuery.orWhere('gift.product_slug ILIKE :searchQuery', {
            searchQuery: `%${query.searchQuery}%`,
          });
          subQuery.orWhere('gift.category_slug ILIKE :searchQuery', {
            searchQuery: `%${query.searchQuery}%`,
          });
        }),
      );
    }

    return helper.paginate(query);
  }

  private createGiftBaseQuery() {
    return this.repo
      .createQueryBuilder('gift')
      .innerJoinAndSelect('gift.event', 'event')
      .innerJoinAndSelect('gift.recipientParticipant', 'recipientParticipant')
      .leftJoinAndSelect(
        'recipientParticipant.eventContact',
        'recipientContact',
      )
      .leftJoinAndSelect('gift.giverParticipant', 'giverParticipant')
      .leftJoinAndSelect('giverParticipant.eventContact', 'giverContact')
      .select([
        'gift',
        'event.id',
        'event.title',
        'event.description',
        'event.eventTypeId',
        'event.eventDate',
        'event.status',
        'recipientParticipant',
        'recipientContact.id',
        'recipientContact.firstName',
        'recipientContact.lastName',
        'recipientContact.email',
        'giverParticipant',
        'giverContact.id',
        'giverContact.firstName',
        'giverContact.lastName',
        'giverContact.email',
      ]);
  }

  private applyGiftSearch(
    qb: ReturnType<Repository<EventGift>['createQueryBuilder']>,
    searchQuery?: string,
  ) {
    if (!searchQuery) {
      return;
    }

    qb.andWhere(
      new Brackets((subQuery) => {
        subQuery.where('gift.title ILIKE :searchQuery', {
          searchQuery: `%${searchQuery}%`,
        });
        subQuery.orWhere('gift.description ILIKE :searchQuery', {
          searchQuery: `%${searchQuery}%`,
        });
        subQuery.orWhere('gift.product_slug ILIKE :searchQuery', {
          searchQuery: `%${searchQuery}%`,
        });
        subQuery.orWhere('gift.category_slug ILIKE :searchQuery', {
          searchQuery: `%${searchQuery}%`,
        });
      }),
    );
  }

  async findSelectedGiftsForEvent(
    eventId: string,
    ownerContactId: string,
    query: FindGiftsQueryDto,
  ): Promise<PaginatedRecordsDto<EventGift>> {
    const qb = this.repo
      .createQueryBuilder('gift')
      .innerJoinAndSelect('gift.event', 'event')
      .innerJoinAndSelect('gift.recipientParticipant', 'recipientParticipant')
      .leftJoinAndSelect(
        'recipientParticipant.eventContact',
        'recipientContact',
      )
      .leftJoinAndSelect('gift.giverParticipant', 'giverParticipant')
      .leftJoinAndSelect('giverParticipant.eventContact', 'giverContact')
      .select([
        'gift',
        'event.id',
        'event.title',
        'event.description',
        'event.eventTypeId',
        'event.eventDate',
        'event.status',
        'recipientParticipant',
        'recipientContact.id',
        'recipientContact.firstName',
        'recipientContact.lastName',
        'recipientContact.email',
        'giverParticipant',
        'giverContact.id',
        'giverContact.firstName',
        'giverContact.lastName',
        'giverContact.email',
      ])
      .where('gift.event_id = :eventId', { eventId })
      .andWhere('event.created_by_id = :ownerContactId', { ownerContactId });
    const helper = new QueryBuilderHelper(qb);

    helper
      .applyFilter({
        'gift.recipient_participant_id': query.recipientParticipantId,
        'gift.giver_participant_id': query.giverParticipantId,
      })
      .applyDateRange('gift.createdAt', query.startDate, query.endDate)
      .applySorting('gift.createdAt', query.sortOrder);

    if (query.searchQuery) {
      qb.andWhere(
        new Brackets((subQuery) => {
          subQuery.where('gift.title ILIKE :searchQuery', {
            searchQuery: `%${query.searchQuery}%`,
          });
          subQuery.orWhere('gift.description ILIKE :searchQuery', {
            searchQuery: `%${query.searchQuery}%`,
          });
          subQuery.orWhere('gift.product_slug ILIKE :searchQuery', {
            searchQuery: `%${query.searchQuery}%`,
          });
          subQuery.orWhere('gift.category_slug ILIKE :searchQuery', {
            searchQuery: `%${query.searchQuery}%`,
          });
          subQuery.orWhere('recipientContact."firstName" ILIKE :searchQuery', {
            searchQuery: `%${query.searchQuery}%`,
          });
          subQuery.orWhere('recipientContact."lastName" ILIKE :searchQuery', {
            searchQuery: `%${query.searchQuery}%`,
          });
          subQuery.orWhere('recipientContact.email ILIKE :searchQuery', {
            searchQuery: `%${query.searchQuery}%`,
          });
        }),
      );
    }

    return helper.paginate(query);
  }
}
