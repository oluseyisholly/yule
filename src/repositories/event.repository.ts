import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Brackets, DataSource, Repository } from 'typeorm';
import { EventOption } from 'src/common/index.enum';
import { FindParticipatedEventsQueryDto } from 'src/dtos/event.dto';
import { PaginatedRecordsDto } from 'src/dtos/general.dto';
import { Event } from 'src/entities/event.entity';
import { QueryBuilderHelper } from 'src/utils/queryBuilder.utils';
import { BaseRepository } from './base.repository';

const DRAFT_EVENT_STATUS = 'draft';

@Injectable()
export class EventRepository extends BaseRepository<Event> {
  constructor(
    @InjectDataSource() dataSource: DataSource,
    @InjectRepository(Event) repo: Repository<Event>,
  ) {
    super(dataSource, repo);
  }

  findParticipatedEvents(
    query: FindParticipatedEventsQueryDto,
    contactId: string,
  ): Promise<PaginatedRecordsDto<Event>> {
    const qb = this.repo
      .createQueryBuilder('event')
      .innerJoin(
        'event.participants',
        'currentParticipant',
        'currentParticipant.event_contact_id = :contactId',
        { contactId },
      )
      .leftJoinAndSelect('event.eventType', 'eventType')
      .leftJoinAndSelect('event.drawNameEvent', 'drawNameEvent')
      .leftJoinAndSelect('event.wishlistEvent', 'wishlistEvent')
      .leftJoinAndSelect('event.giftingEvent', 'giftingEvent')
      .leftJoinAndSelect('event.hangoutEvent', 'hangoutEvent')
      .leftJoinAndSelect('event.createdBy', 'createdBy')
      .leftJoinAndSelect('event.participants', 'participant')
      .leftJoinAndSelect('participant.eventContact', 'participantContact')
      .select([
        'event.id',
        'event.title',
        'event.description',
        'event.eventTypeId',
        'event.eventOption',
        'event.eventDate',
        'event.status',
        'event.createdAt',
        'event.updatedAt',
        'eventType.id',
        'eventType.name',
        'eventType.key',
        'eventType.description',
        'drawNameEvent.id',
        'drawNameEvent.eventId',
        'wishlistEvent.id',
        'wishlistEvent.eventId',
        'giftingEvent.id',
        'giftingEvent.eventId',
        'hangoutEvent.eventId',
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

    qb.andWhere('event.status != :draftEventStatus', {
      draftEventStatus: DRAFT_EVENT_STATUS,
    });

    const helper = new QueryBuilderHelper(qb);

    helper
      .applyFilter({
        'event.status': query.status,
        'event.eventOption': query.eventOption as EventOption | undefined,
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
}
