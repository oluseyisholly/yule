import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import {
  Brackets,
  DataSource,
  DeepPartial,
  In,
  IsNull,
  Repository,
} from 'typeorm';
import { RequestContext } from 'src/common/context/requestContext';
import {
  FindGiftsQueryDto,
  GroupedGivenGiftResponseDto,
} from 'src/dtos/gift.dto';
import { PaginatedRecordsDto, normalizePagination } from 'src/dtos/general.dto';
import { Contact } from 'src/entities/contact.entity';
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
        'event.createdById',
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
    query: FindGiftsQueryDto,
  ): Promise<PaginatedRecordsDto<EventGift>> {
    const qb = this.createGiftBaseQuery()
      .innerJoin(
        WishlistEvent,
        'wishlistEvent',
        'wishlistEvent.event_id = event.id',
      )
      .where('wishlistEvent.id = :wishlistEventId', { wishlistEventId })
      .andWhere(
        '"recipientParticipant".event_contact_id = event.created_by_id',
      );
    const helper = new QueryBuilderHelper(qb);

    helper
      .applyDateRange('gift.createdAt', query.startDate, query.endDate)
      .applySorting('gift.createdAt', query.sortOrder);

    this.applyGiftSearch(qb, query.searchQuery);

    return helper.paginate(query);
  }

  async findClaimedGiftIdsByWishlistEventId(
    wishlistEventId: string,
  ): Promise<string[]> {
    const rows = await this.repo
      .createQueryBuilder('gift')
      .innerJoin('gift.event', 'event')
      .innerJoin(
        WishlistEvent,
        'wishlistEvent',
        'wishlistEvent.event_id = event.id',
      )
      .innerJoin('gift.recipientParticipant', 'recipientParticipant')
      .select('gift.id', 'id')
      .where('wishlistEvent.id = :wishlistEventId', { wishlistEventId })
      .andWhere('"recipientParticipant".event_contact_id = event.created_by_id')
      .andWhere('gift.giver_participant_id IS NOT NULL')
      .getRawMany<{ id: string }>();

    return rows.map((row) => row.id);
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
          "currentParticipant".event_id = gift.event_id
          AND "currentParticipant".event_contact_id = :contactId
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
        'event.createdById',
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
            '"recipientParticipant".event_contact_id = :contactId',
            {
              contactId,
            },
          );
          subQuery.orWhere(
            '"recipientParticipant".gift_giver_participant_id = "currentParticipant".id',
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
    const qb = this.createGiftBaseQuery().where(
      '"giverParticipant".event_contact_id = :contactId',
      { contactId },
    );
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

  async findReceivedGiftsByContact(
    contactId: string,
    query: FindGiftsQueryDto,
  ): Promise<PaginatedRecordsDto<EventGift>> {
    const qb = this.createGiftBaseQuery().where(
      '"recipientParticipant".event_contact_id = :contactId',
      { contactId },
    );
    const helper = new QueryBuilderHelper(qb);

    helper
      .applyFilter({
        'gift.event_id': query.eventId,
        'gift.giver_participant_id': query.giverParticipantId,
      })
      .applyDateRange('gift.createdAt', query.startDate, query.endDate)
      .applySorting('gift.createdAt', query.sortOrder);

    this.applyGiftSearch(qb, query.searchQuery);

    return helper.paginate(query);
  }

  async findGivenGiftsByContactForEvent(
    eventId: string,
    contactId: string,
    query: FindGiftsQueryDto,
  ): Promise<PaginatedRecordsDto<GroupedGivenGiftResponseDto>> {
    return this.findGroupedGivenGiftsByContact(contactId, query, eventId);
  }

  async findGivenGiftsByContact(
    contactId: string,
    query: FindGiftsQueryDto,
  ): Promise<PaginatedRecordsDto<GroupedGivenGiftResponseDto>> {
    return this.findGroupedGivenGiftsByContact(contactId, query);
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

  async assignGiftsToParticipants(
    eventId: string,
    giverParticipantId: string,
    recipientParticipantIds: string[],
    gifts: DeepPartial<EventGift>[],
  ): Promise<EventGift[]> {
    const actorId = RequestContext.getActorId();

    return this.dataSource.transaction(async (manager) => {
      const giftRepo = manager.getRepository(EventGift);

      await manager
        .createQueryBuilder()
        .delete()
        .from('event_gifts')
        .where('event_id = :eventId', { eventId })
        .execute();

      const giftRows = recipientParticipantIds.flatMap(
        (recipientParticipantId) =>
          gifts.map((gift) => ({
            event_id: eventId,
            giver_participant_id: giverParticipantId,
            recipient_participant_id: recipientParticipantId,
            participant_gift_id: gift.participantGiftId,
            title: gift.title,
            description: gift.description ?? null,
            amount: gift.amount,
            currency: gift.currency ?? 'NGN',
            image_url: gift.imageUrl ?? null,
            category_slug: gift.categorySlug ?? null,
            sub_category_slug: gift.subCategorySlug ?? null,
            condition: gift.condition ?? null,
            location_state: gift.locationState ?? null,
            location_city: gift.locationCity ?? null,
            seller_id: gift.sellerId ?? null,
            product_slug: gift.productSlug ?? null,
            created_by_id: actorId,
          })),
      );

      const insertColumns = [
        'event_id',
        'giver_participant_id',
        'recipient_participant_id',
        'participant_gift_id',
        'title',
        'description',
        'amount',
        'currency',
        'image_url',
        'category_slug',
        'sub_category_slug',
        'condition',
        'location_state',
        'location_city',
        'seller_id',
        'product_slug',
        'created_by_id',
      ];
      const insertValues: unknown[] = [];
      const insertPlaceholders = giftRows.map((row) => {
        const rowPlaceholders = insertColumns.map((column) => {
          insertValues.push(row[column as keyof typeof row]);

          return `$${insertValues.length}`;
        });

        return `(${rowPlaceholders.join(', ')})`;
      });
      const insertedRows = await manager.query(
        `
          INSERT INTO "event_gifts" (
            "event_id",
            "giver_participant_id",
            "recipient_participant_id",
            "participant_gift_id",
            "title",
            "description",
            "amount",
            "currency",
            "image_url",
            "category_slug",
            "sub_category_slug",
            "condition",
            "location_state",
            "location_city",
            "seller_id",
            "product_slug",
            "created_by_id"
          )
          VALUES ${insertPlaceholders.join(', ')}
          RETURNING "id"
        `,
        insertValues,
      );

      const insertedIds = insertedRows
        .map((row: { id?: string }) => row.id)
        .filter((id): id is string => Boolean(id));

      if (!insertedIds.length) {
        return [];
      }

      return giftRepo.find({
        where: {
          id: In(insertedIds),
        },
        relations: {
          event: true,
          recipientParticipant: true,
          giverParticipant: true,
        },
      });
    });
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

  async findParticipantIdsByEvent(
    participantIds: string[],
    eventId: string,
  ): Promise<string[]> {
    if (!participantIds.length) {
      return [];
    }

    const participants = await this.dataSource
      .getRepository(EventParticipant)
      .find({
        select: {
          id: true,
        },
        where: {
          id: In(participantIds),
          eventId,
        },
      });

    return participants.map((participant) => participant.id);
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
          "currentParticipant".event_id = participant.event_id
          AND "currentParticipant".event_contact_id = :contactId
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
            'participant.gift_giver_participant_id = "currentParticipant".id',
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
          "currentParticipant".event_id = gift.event_id
          AND "currentParticipant".event_contact_id = :contactId
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
            '"recipientParticipant".event_contact_id = :contactId',
            {
              contactId,
            },
          );
          subQuery.orWhere(
            '"recipientParticipant".gift_giver_participant_id = "currentParticipant".id',
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
        '"recipientParticipant".gift_giver_participant_id = :giverParticipantId',
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
          subQuery.orWhere(
            '"recipientContact"."firstName" ILIKE :searchQuery',
            {
              searchQuery: `%${query.searchQuery}%`,
            },
          );
          subQuery.orWhere('"recipientContact"."lastName" ILIKE :searchQuery', {
            searchQuery: `%${query.searchQuery}%`,
          });
          subQuery.orWhere('"recipientContact".email ILIKE :searchQuery', {
            searchQuery: `%${query.searchQuery}%`,
          });
        }),
      );
    }

    return helper.paginate(query);
  }

  private async findGroupedGivenGiftsByContact(
    contactId: string,
    query: FindGiftsQueryDto,
    eventId?: string,
  ): Promise<PaginatedRecordsDto<GroupedGivenGiftResponseDto>> {
    const { page, pageSize } = normalizePagination(query);
    const skip = (page - 1) * pageSize;

    const groupedQb = this.repo
      .createQueryBuilder('gift')
      .innerJoin('gift.event', 'event')
      .innerJoin(
        EventParticipant,
        'giver_participant',
        'giver_participant.id = gift.giver_participant_id',
      )
      .innerJoin(
        EventParticipant,
        'recipient_participant',
        'recipient_participant.id = gift.recipient_participant_id',
      )
      .leftJoin(
        Contact,
        'recipient_contact',
        'recipient_contact.id = recipient_participant.event_contact_id',
      )
      .where('giver_participant.event_contact_id = :contactId', { contactId });

    if (eventId) {
      groupedQb.andWhere('gift.event_id = :eventId', { eventId });
    }

    if (query.recipientParticipantId) {
      groupedQb.andWhere(
        'gift.recipient_participant_id = :recipientParticipantId',
        {
          recipientParticipantId: query.recipientParticipantId,
        },
      );
    }

    if (query.giverParticipantId) {
      groupedQb.andWhere('gift.giver_participant_id = :giverParticipantId', {
        giverParticipantId: query.giverParticipantId,
      });
    }

    if (query.startDate) {
      groupedQb.andWhere('gift.created_at >= :groupedStartDate', {
        groupedStartDate: query.startDate,
      });
    }

    if (query.endDate) {
      groupedQb.andWhere('gift.created_at <= :groupedEndDate', {
        groupedEndDate: query.endDate,
      });
    }

    if (query.searchQuery) {
      groupedQb.andWhere(
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
          subQuery.orWhere('event.title ILIKE :searchQuery', {
            searchQuery: `%${query.searchQuery}%`,
          });
          subQuery.orWhere('event.description ILIKE :searchQuery', {
            searchQuery: `%${query.searchQuery}%`,
          });
          subQuery.orWhere('recipient_contact."firstName" ILIKE :searchQuery', {
            searchQuery: `%${query.searchQuery}%`,
          });
          subQuery.orWhere('recipient_contact."lastName" ILIKE :searchQuery', {
            searchQuery: `%${query.searchQuery}%`,
          });
          subQuery.orWhere('recipient_contact.email ILIKE :searchQuery', {
            searchQuery: `%${query.searchQuery}%`,
          });
        }),
      );
    }

    const groupedCountQb = groupedQb
      .clone()
      .select('gift.event_id', 'eventId')
      .addSelect('gift.participantGiftId', 'participantGiftId')
      .groupBy('gift.event_id')
      .addGroupBy('gift.participantGiftId');

    const totalResult = await this.dataSource
      .createQueryBuilder()
      .select('COUNT(*)', 'count')
      .from(`(${groupedCountQb.getQuery()})`, 'grouped_gifts')
      .setParameters(groupedCountQb.getParameters())
      .getRawOne<{ count: string }>();
    const total = Number(totalResult?.count ?? 0);

    const groupedGiftRows = await groupedQb
      .clone()
      .select('gift.event_id', 'eventId')
      .addSelect('gift.participantGiftId', 'participantGiftId')
      .addSelect('gift.title', 'title')
      .addSelect('gift.description', 'description')
      .addSelect('gift.amount', 'amount')
      .addSelect('gift.currency', 'currency')
      .addSelect('gift.imageUrl', 'imageUrl')
      .addSelect('gift.categorySlug', 'categorySlug')
      .addSelect('gift.subCategorySlug', 'subCategorySlug')
      .addSelect('gift.condition', 'condition')
      .addSelect('gift.locationState', 'locationState')
      .addSelect('gift.locationCity', 'locationCity')
      .addSelect('gift.sellerId', 'sellerId')
      .addSelect('gift.productSlug', 'productSlug')
      .addSelect('event.id', 'eventId')
      .addSelect('event.title', 'eventTitle')
      .addSelect('event.description', 'eventDescription')
      .addSelect('event.event_type_id', 'eventTypeId')
      .addSelect('event.eventDate', 'eventDate')
      .addSelect('event.status', 'eventStatus')
      .addSelect(
        'COUNT(DISTINCT recipient_participant.id)::int',
        'recipientCount',
      )
      .addSelect(
        `
          COALESCE(
            json_agg(
              DISTINCT jsonb_build_object(
                'firstName', recipient_contact."firstName",
                'lastName', recipient_contact."lastName",
                'email', recipient_contact.email
              )
            ) FILTER (WHERE recipient_contact.id IS NOT NULL),
            '[]'
          )
        `,
        'people',
      )
      .addSelect('MAX(gift.created_at)', 'latestCreatedAt')
      .groupBy('gift.event_id')
      .addGroupBy('gift.participantGiftId')
      .addGroupBy('gift.title')
      .addGroupBy('gift.description')
      .addGroupBy('gift.amount')
      .addGroupBy('gift.currency')
      .addGroupBy('gift.imageUrl')
      .addGroupBy('gift.categorySlug')
      .addGroupBy('gift.subCategorySlug')
      .addGroupBy('gift.condition')
      .addGroupBy('gift.locationState')
      .addGroupBy('gift.locationCity')
      .addGroupBy('gift.sellerId')
      .addGroupBy('gift.productSlug')
      .addGroupBy('event.id')
      .addGroupBy('event.title')
      .addGroupBy('event.description')
      .addGroupBy('event.event_type_id')
      .addGroupBy('event.eventDate')
      .addGroupBy('event.status')
      .orderBy('MAX(gift.created_at)', query.sortOrder ?? 'DESC')
      .offset(skip)
      .limit(pageSize)
      .getRawMany<{
        eventId: string;
        participantGiftId: string;
        title: string;
        description: string | null;
        amount: string | number;
        currency: string;
        imageUrl: string | null;
        categorySlug: string | null;
        subCategorySlug: string | null;
        condition: string | null;
        locationState: string | null;
        locationCity: string | null;
        sellerId: string | null;
        productSlug: string | null;
        eventTitle: string;
        eventDescription: string | null;
        eventTypeId: string;
        eventDate: Date | null;
        eventStatus: string;
        recipientCount: number;
        people:
          | Array<{
              firstName?: string;
              lastName?: string;
              email?: string;
            }>
          | string
          | null;
      }>();

    return {
      data: groupedGiftRows.map((row) => ({
        participantGiftId: row.participantGiftId,
        title: row.title,
        description: row.description,
        amount: Number(row.amount),
        currency: row.currency,
        imageUrl: row.imageUrl,
        categorySlug: row.categorySlug,
        subCategorySlug: row.subCategorySlug,
        condition: row.condition,
        locationState: row.locationState,
        locationCity: row.locationCity,
        sellerId: row.sellerId,
        productSlug: row.productSlug,
        recipientCount: Number(row.recipientCount),
        people:
          typeof row.people === 'string'
            ? JSON.parse(row.people)
            : (row.people ?? []),
        event: {
          id: row.eventId,
          title: row.eventTitle,
          description: row.eventDescription,
          eventTypeId: row.eventTypeId,
          eventDate: row.eventDate ?? undefined,
          status: row.eventStatus,
        },
      })),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }
}
