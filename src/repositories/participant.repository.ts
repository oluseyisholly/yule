import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Brackets, DataSource, In, Repository } from 'typeorm';
import {
  AssignParticipantGiverDto,
  FindParticipantsQueryDto,
} from 'src/dtos/participant.dto';
import { PaginatedRecordsDto } from 'src/dtos/general.dto';
import { Contact } from 'src/entities/contact.entity';
import { Event } from 'src/entities/event.entity';
import { EventParticipantExclusion } from 'src/entities/event-participant-exclusion.entity';
import {
  EventParticipant,
  EventParticipantRole,
} from 'src/entities/event-participant.entity';
import { QueryBuilderHelper } from 'src/utils/queryBuilder.utils';
import { BaseRepository } from './base.repository';

@Injectable()
export class ParticipantRepository extends BaseRepository<EventParticipant> {
  constructor(
    @InjectDataSource() dataSource: DataSource,
    @InjectRepository(EventParticipant) repo: Repository<EventParticipant>,
  ) {
    super(dataSource, repo);
  }

  async findAllParticipants(
    query: FindParticipantsQueryDto,
    ownerContactId: string,
  ): Promise<PaginatedRecordsDto<EventParticipant>> {
    const qb = this.repo
      .createQueryBuilder('participant')
      .innerJoinAndSelect('participant.event', 'event')
      .leftJoinAndSelect('participant.eventContact', 'eventContact')
      .select([
        'participant',
        'event.id',
        'event.title',
        'event.description',
        'event.eventTypeId',
        'event.eventDate',
        'event.status',
        'eventContact.id',
        'eventContact.firstName',
        'eventContact.lastName',
        'eventContact.email',
      ]);
    const helper = new QueryBuilderHelper(qb);

    helper
      .applyFilter({
        'participant.event_id': query.eventId,
        'participant.event_contact_id': query.contactId,
        'participant.role': query.role,
      })
      .applyDateRange('participant.createdAt', query.startDate, query.endDate)
      .applySorting('participant.createdAt', query.sortOrder);

    qb.andWhere('event.created_by_id = :ownerContactId', { ownerContactId });

    if (query.unpairedOnly) {
      qb.andWhere('participant.gift_giver_participant_id IS NULL');
      this.excludeParticipantsBlockedForCurrentUser(qb, ownerContactId);
    }

    return helper.paginate(query);
  }

  async findAllParticipantsReadableByContact(
    query: FindParticipantsQueryDto,
    contactId: string,
  ): Promise<PaginatedRecordsDto<EventParticipant>> {
    const qb = this.repo
      .createQueryBuilder('participant')
      .innerJoinAndSelect('participant.event', 'event')
      .leftJoinAndSelect('participant.eventContact', 'eventContact')
      .select([
        'participant',
        'event.id',
        'event.title',
        'event.description',
        'event.eventTypeId',
        'event.eventDate',
        'event.status',
        'eventContact.id',
        'eventContact.firstName',
        'eventContact.lastName',
        'eventContact.email',
      ]);
    const helper = new QueryBuilderHelper(qb);

    helper
      .applyFilter({
        'participant.event_id': query.eventId,
        'participant.event_contact_id': query.contactId,
        'participant.role': query.role,
      })
      .applyDateRange('participant.createdAt', query.startDate, query.endDate)
      .applySorting('participant.createdAt', query.sortOrder);

    qb.andWhere(
      new Brackets((subQuery) => {
        subQuery.where('event.created_by_id = :contactId', { contactId });
        subQuery.orWhere(
          `EXISTS ${this.createParticipantAccessSubQuery(qb)}`,
          { contactId },
        );
      }),
    );

    if (query.unpairedOnly) {
      qb.andWhere('participant.gift_giver_participant_id IS NULL');
      this.excludeParticipantsBlockedForCurrentUser(qb, contactId);
    }

    return helper.paginate(query);
  }

  private createParticipantAccessSubQuery(
    qb: ReturnType<Repository<EventParticipant>['createQueryBuilder']>,
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

  private excludeParticipantsBlockedForCurrentUser(
    qb: ReturnType<Repository<EventParticipant>['createQueryBuilder']>,
    currentContactId: string,
  ) {
    const excludedParticipantSubQuery = qb
      .subQuery()
      .select(
        `
          CASE
            WHEN exclusion.participant_one_id = currentParticipant.id
              THEN exclusion.participant_two_id
            ELSE exclusion.participant_one_id
          END
        `,
      )
      .from(EventParticipantExclusion, 'exclusion')
      .innerJoin(
        EventParticipant,
        'currentParticipant',
        `
          currentParticipant.event_id = exclusion.event_id
          AND (
            currentParticipant.id = exclusion.participant_one_id
            OR currentParticipant.id = exclusion.participant_two_id
          )
        `,
      )
      .where('exclusion.event_id = participant.event_id')
      .andWhere('currentParticipant.event_contact_id = :currentContactId')
      .getQuery();

    qb.andWhere(`participant.id NOT IN ${excludedParticipantSubQuery}`, {
      currentContactId,
    });
  }

  async findByIdForUser(
    id: string,
    ownerContactId: string,
  ): Promise<EventParticipant | null> {
    return this.repo
      .createQueryBuilder('participant')
      .innerJoinAndSelect('participant.event', 'event')
      .leftJoinAndSelect('participant.eventContact', 'eventContact')
      .select([
        'participant',
        'event.id',
        'event.title',
        'event.description',
        'event.eventTypeId',
        'event.eventDate',
        'event.status',
        'eventContact.id',
        'eventContact.firstName',
        'eventContact.lastName',
        'eventContact.email',
        'eventContact.phoneNumber',
      ])
      .where('participant.id = :id', { id })
      .andWhere('event.created_by_id = :ownerContactId', { ownerContactId })
      .getOne();
  }

  async findParticipantsForInvitations(
    eventId: string,
    ownerContactId: string,
  ): Promise<EventParticipant[]> {
    return this.repo
      .createQueryBuilder('participant')
      .innerJoinAndSelect('participant.event', 'event')
      .leftJoinAndSelect('participant.eventContact', 'eventContact')
      .select([
        'participant',
        'event.id',
        'event.title',
        'event.createdById',
        'eventContact.id',
        'eventContact.firstName',
        'eventContact.lastName',
        'eventContact.email',
        'eventContact.phoneNumber',
      ])
      .where('participant.event_id = :eventId', { eventId })
      .andWhere('event.created_by_id = :ownerContactId', { ownerContactId })
      .getMany();
  }

  async findByDrawNameEventIdAndContactId(
    drawNameEventId: string,
    contactId: string,
  ): Promise<EventParticipant | null> {
    return this.repo
      .createQueryBuilder('participant')
      .innerJoin('participant.event', 'event')
      .innerJoin('event.drawNameEvent', 'drawNameEvent')
      .select(['participant'])
      .where('drawNameEvent.id = :drawNameEventId', { drawNameEventId })
      .andWhere('participant.event_contact_id = :contactId', { contactId })
      .getOne();
  }

  async findByEventIdAndContactId(
    eventId: string,
    contactId: string,
  ): Promise<EventParticipant | null> {
    return this.repo
      .createQueryBuilder('participant')
      .leftJoinAndSelect('participant.eventContact', 'eventContact')
      .leftJoinAndSelect(
        'participant.giftGiverParticipant',
        'giftGiverParticipant',
      )
      .leftJoinAndSelect(
        'giftGiverParticipant.eventContact',
        'giftGiverEventContact',
      )
      .select([
        'participant',
        'eventContact.id',
        'eventContact.firstName',
        'eventContact.lastName',
        'eventContact.email',
        'giftGiverParticipant.id',
        'giftGiverParticipant.eventContactId',
        'giftGiverEventContact.id',
        'giftGiverEventContact.firstName',
        'giftGiverEventContact.lastName',
        'giftGiverEventContact.email',
      ])
      .where('participant.event_id = :eventId', { eventId })
      .andWhere('participant.event_contact_id = :contactId', { contactId })
      .getOne();
  }

  async findGiftRecipientForGiver(
    eventId: string,
    giverParticipantId: string,
  ): Promise<EventParticipant | null> {
    return this.repo
      .createQueryBuilder('participant')
      .leftJoinAndSelect('participant.eventContact', 'eventContact')
      .select([
        'participant',
        'eventContact.id',
        'eventContact.firstName',
        'eventContact.lastName',
        'eventContact.email',
      ])
      .where('participant.event_id = :eventId', { eventId })
      .andWhere('participant.gift_giver_participant_id = :giverParticipantId', {
        giverParticipantId,
      })
      .getOne();
  }

  async eventBelongsToUser(
    eventId: string,
    ownerContactId: string,
  ): Promise<boolean> {
    return this.dataSource.getRepository(Event).exist({
      where: {
        id: eventId,
        createdById: ownerContactId,
      },
    });
  }

  async contactBelongsToUser(
    eventContactId: string,
    ownerContactId: string,
  ): Promise<boolean> {
    const count = await this.dataSource
      .getRepository(Contact)
      .createQueryBuilder('contact')
      .innerJoin(
        'contact_connections',
        'connection',
        'connection.contact_id = contact.id',
      )
      .where('contact.id = :eventContactId', { eventContactId })
      .andWhere('connection.owner_contact_id = :ownerContactId', {
        ownerContactId,
      })
      .getCount();

    return count > 0;
  }

  async findContactsByIdsForUser(
    contactIds: string[],
    ownerContactId: string,
  ): Promise<Contact[]> {
    if (!contactIds.length) {
      return [];
    }

    return this.dataSource
      .getRepository(Contact)
      .createQueryBuilder('contact')
      .innerJoin(
        'contact_connections',
        'connection',
        'connection.contact_id = contact.id',
      )
      .where('contact.id IN (:...contactIds)', { contactIds })
      .andWhere('connection.owner_contact_id = :ownerContactId', {
        ownerContactId,
      })
      .getMany();
  }

  async participantExistsForEventContact(
    eventId: string,
    eventContactId: string,
  ): Promise<boolean> {
    return this.repo.exist({
      where: {
        eventId,
        eventContactId,
      },
    });
  }

  async allParticipantsPairActive(eventId: string): Promise<boolean> {
    const totalParticipants = await this.repo.count({
      where: {
        eventId,
      },
    });

    if (!totalParticipants) {
      return false;
    }

    const inactiveParticipants = await this.repo.count({
      where: {
        eventId,
        isPairActive: false,
      },
    });

    return inactiveParticipants === 0;
  }

  async findContactIdsByEventId(eventId: string): Promise<string[]> {
    const rows = await this.repo
      .createQueryBuilder('participant')
      .select('participant.eventContactId', 'contactId')
      .where('participant.event_id = :eventId', { eventId })
      .andWhere('participant.event_contact_id IS NOT NULL')
      .getRawMany<{ contactId: string }>();

    return rows.map((row) => row.contactId);
  }

  async findParticipantsForGiverAssignments(
    participantIds: string[],
    ownerContactId: string,
  ): Promise<EventParticipant[]> {
    if (!participantIds.length) {
      return [];
    }

    return this.repo
      .createQueryBuilder('participant')
      .innerJoinAndSelect('participant.event', 'event')
      .leftJoinAndSelect('participant.eventContact', 'eventContact')
      .select([
        'participant',
        'event.id',
        'event.title',
        'event.description',
        'event.eventTypeId',
        'event.eventDate',
        'event.status',
        'eventContact.id',
        'eventContact.firstName',
        'eventContact.lastName',
        'eventContact.email',
        'eventContact.gender',
        'eventContact.phoneNumber',
        'eventContact.note',
      ])
      .where('participant.id IN (:...participantIds)', { participantIds })
      .andWhere('event.created_by_id = :ownerContactId', { ownerContactId })
      .getMany();
  }

  async bulkAssignParticipantGivers(
    assignments: AssignParticipantGiverDto[],
  ): Promise<EventParticipant[]> {
    return this.dataSource.transaction(async (manager) => {
      const participantRepo = manager.getRepository(EventParticipant);

      await Promise.all(
        assignments.map((assignment) =>
          participantRepo.update(assignment.participantId, {
            giftGiverParticipantId: assignment.giftGiverParticipantId,
          }),
        ),
      );

      return participantRepo.find({
        where: {
          id: In(assignments.map((assignment) => assignment.participantId)),
        },
        relations: {
          event: true,
          eventContact: true,
        },
      });
    });
  }

  async findParticipantsForDraw(
    eventId: string,
    ownerContactId: string,
  ): Promise<EventParticipant[]> {
    return this.repo
      .createQueryBuilder('participant')
      .innerJoinAndSelect('participant.event', 'event')
      .leftJoinAndSelect('participant.eventContact', 'eventContact')
      .select([
        'participant',
        'event.id',
        'event.status',
        'event.createdById',
        'eventContact.id',
        'eventContact.firstName',
        'eventContact.lastName',
        'eventContact.email',
      ])
      .where('participant.event_id = :eventId', { eventId })
      .andWhere('event.created_by_id = :ownerContactId', { ownerContactId })
      .getMany();
  }

  async replaceDrawAssignments(
    eventId: string,
    assignments: AssignParticipantGiverDto[],
  ): Promise<EventParticipant[]> {
    return this.dataSource.transaction(async (manager) => {
      const participantRepo = manager.getRepository(EventParticipant);

      await participantRepo.update(
        { eventId },
        { giftGiverParticipantId: null },
      );

      if (assignments.length) {
        await Promise.all(
          assignments.map((assignment) =>
            participantRepo.update(assignment.participantId, {
              giftGiverParticipantId: assignment.giftGiverParticipantId,
            }),
          ),
        );
      }

      return participantRepo.find({
        where: {
          eventId,
        },
        relations: {
          event: true,
          eventContact: true,
        },
      });
    });
  }

  async replaceBulkParticipantsFromContactIds(
    eventId: string,
    contactIds: string[],
    ownerContactId: string,
    role: EventParticipantRole = EventParticipantRole.PARTICIPANT,
    hostContactId?: string,
  ): Promise<EventParticipant[]> {
    const uniqueContactIds = Array.from(new Set(contactIds));

    return this.dataSource.transaction(async (manager) => {
      const contactRepo = manager.getRepository(Contact);
      const participantRepo = manager.getRepository(EventParticipant);
      const existingHostParticipant = hostContactId
        ? await participantRepo.findOne({
            where: {
              eventId,
              eventContactId: hostContactId,
            },
          })
        : null;

      await participantRepo.update(
        { eventId },
        { giftGiverParticipantId: null },
      );
      await participantRepo.delete({ eventId });

      const contacts = await contactRepo.find({
        where: {
          id: In(uniqueContactIds),
        },
      });

      const participants = contacts.map((contact) =>
        participantRepo.create({
          eventId,
          eventContactId: contact.id,
          role:
            hostContactId &&
            contact.id === hostContactId &&
            existingHostParticipant?.role === EventParticipantRole.CREATOR
              ? EventParticipantRole.CREATOR
              : hostContactId && contact.id === hostContactId
                ? EventParticipantRole.HOST
                : role,
          isPairActive: false,
          createdById: ownerContactId,
        }),
      );

      return participants.length ? participantRepo.save(participants) : [];
    });
  }
}
