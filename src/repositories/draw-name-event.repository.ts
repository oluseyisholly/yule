import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Brackets, DataSource, DeepPartial, Repository } from 'typeorm';
import { RequestContext } from 'src/common/context/requestContext';
import { EventOption } from 'src/common/index.enum';
import {
  FindDrawNameEventsQueryDto,
  UpdateDrawNameEventBaseEventDto,
  UpdateDrawNameEventDetailsDto,
} from 'src/dtos/draw-name-event.dto';
import { PaginatedRecordsDto } from 'src/dtos/general.dto';
import { DrawNameEvent } from 'src/entities/draw-name-event.entity';
import { Event } from 'src/entities/event.entity';
import { QueryBuilderHelper } from 'src/utils/queryBuilder.utils';
import { BaseRepository } from './base.repository';

type UpdateDrawNameEventRepositoryPayload = {
  event?: UpdateDrawNameEventBaseEventDto & { status?: string };
  drawName?: UpdateDrawNameEventDetailsDto;
};

@Injectable()
export class DrawNameEventRepository extends BaseRepository<DrawNameEvent> {
  constructor(
    @InjectDataSource() dataSource: DataSource,
    @InjectRepository(DrawNameEvent) repo: Repository<DrawNameEvent>,
  ) {
    super(dataSource, repo);
  }

  async createDrawNameEvent(
    eventPayload: DeepPartial<Event>,
    drawNamePayload: DeepPartial<DrawNameEvent>,
  ): Promise<DrawNameEvent> {
    const actorId = RequestContext.getActorId();

    return this.dataSource.transaction(async (manager) => {
      const eventRepo = manager.getRepository(Event);
      const drawNameEventRepo = manager.getRepository(DrawNameEvent);

      const event = await eventRepo.save(
        eventRepo.create({
          ...eventPayload,
          eventOption: EventOption.DRAW_NAME,
          createdById: actorId,
        }),
      );

      await drawNameEventRepo.save(
        drawNameEventRepo.create({
          ...drawNamePayload,
          eventId: event.id,
          createdById: actorId,
        }),
      );

      return drawNameEventRepo.findOneOrFail({
        where: { eventId: event.id },
        relations: { event: true },
      });
    });
  }

  async findAllDrawNameEvents(
    query: FindDrawNameEventsQueryDto,
    contactId: string,
  ): Promise<PaginatedRecordsDto<DrawNameEvent>> {
    const qb = this.repo
      .createQueryBuilder('drawNameEvent')
      .innerJoinAndSelect('drawNameEvent.event', 'event')
      .leftJoinAndSelect('event.createdBy', 'createdBy')
      .leftJoinAndSelect('event.participants', 'participant')
      .leftJoinAndSelect('participant.eventContact', 'participantContact')
      .select([
        'drawNameEvent',
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
        }),
      );
    }

    this.applyReadableByContactFilter(qb, contactId);

    return helper.paginate(query);
  }

  findByEventId(
    eventId: string,
    contactId?: string,
  ): Promise<DrawNameEvent | null> {
    const qb = this.repo
      .createQueryBuilder('drawNameEvent')
      .innerJoinAndSelect('drawNameEvent.event', 'event')
      .leftJoinAndSelect('event.createdBy', 'createdBy')
      .leftJoinAndSelect('event.participants', 'participant')
      .leftJoinAndSelect('participant.eventContact', 'participantContact')
      .select([
        'drawNameEvent',
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
      ])
      .where('drawNameEvent.eventId = :eventId', { eventId });

    if (contactId) {
      qb.andWhere('event.created_by_id = :contactId', { contactId });
    }

    return qb.getOne();
  }

  async findBudgetByEventId(eventId: string): Promise<number | null> {
    const drawNameEvent = await this.repo
      .createQueryBuilder('drawNameEvent')
      .select('drawNameEvent.budget', 'budget')
      .where('drawNameEvent.eventId = :eventId', { eventId })
      .getRawOne<{ budget: string | number | null }>();

    if (!drawNameEvent?.budget) {
      return null;
    }

    return Number(drawNameEvent.budget);
  }

  findByIdForUser(
    id: string,
    contactId: string,
  ): Promise<DrawNameEvent | null> {
    return this.repo
      .createQueryBuilder('drawNameEvent')
      .innerJoinAndSelect('drawNameEvent.event', 'event')
      .leftJoinAndSelect('event.createdBy', 'createdBy')
      .leftJoinAndSelect('event.participants', 'participant')
      .leftJoinAndSelect('participant.eventContact', 'participantContact')
      .select([
        'drawNameEvent',
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
      ])
      .where('drawNameEvent.id = :id', { id })
      .andWhere('event.created_by_id = :contactId', { contactId })
      .getOne();
  }

  findByIdReadableByContact(
    id: string,
    contactId: string,
  ): Promise<DrawNameEvent | null> {
    const qb = this.repo
      .createQueryBuilder('drawNameEvent')
      .innerJoinAndSelect('drawNameEvent.event', 'event')
      .leftJoinAndSelect('event.createdBy', 'createdBy')
      .leftJoinAndSelect('event.participants', 'participant')
      .leftJoinAndSelect('participant.eventContact', 'participantContact')
      .select([
        'drawNameEvent',
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
      ])
      .where('drawNameEvent.id = :id', { id });

    this.applyReadableByContactFilter(qb, contactId);

    return qb.getOne();
  }

  private applyReadableByContactFilter(
    qb: ReturnType<Repository<DrawNameEvent>['createQueryBuilder']>,
    contactId: string,
  ) {
    const participantAccessSubQuery = qb
      .subQuery()
      .select('1')
      .from('event_participants', 'access_participant')
      .where('access_participant.event_id = event.id')
      .andWhere('access_participant.event_contact_id = :contactId')
      .andWhere('access_participant.deleted_at IS NULL')
      .getQuery();

    qb.andWhere(
      new Brackets((subQuery) => {
        subQuery.where('event.created_by_id = :contactId', { contactId });
        subQuery.orWhere(
          new Brackets((participantSubQuery) => {
            participantSubQuery.where(`EXISTS ${participantAccessSubQuery}`, {
              contactId,
            });
            participantSubQuery.andWhere('LOWER(event.status) != :draftStatus', {
              draftStatus: 'draft',
            });
          }),
        );
      }),
    );
  }

  async updateDrawNameEvent(
    drawNameEventId: string,
    eventId: string,
    payload: UpdateDrawNameEventRepositoryPayload,
  ): Promise<void> {
    return this.dataSource.transaction(async (manager) => {
      const eventRepo = manager.getRepository(Event);
      const drawNameEventRepo = manager.getRepository(DrawNameEvent);

      if (payload.event) {
        await eventRepo.update(eventId, payload.event);
      }

      if (payload.drawName) {
        await drawNameEventRepo.update(
          { id: drawNameEventId, eventId },
          payload.drawName,
        );
      }
    });
  }

  async deleteDrawNameEvent(
    drawNameEventId: string,
    eventId: string,
  ): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      await manager
        .getRepository(DrawNameEvent)
        .softDelete({ id: drawNameEventId, eventId });
      await manager.getRepository(Event).softDelete(eventId);
    });
  }
}
