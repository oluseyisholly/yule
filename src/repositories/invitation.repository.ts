import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Brackets, DataSource, Repository } from 'typeorm';
import { PaginatedRecordsDto, PaginationDto } from 'src/dtos/general.dto';
import {
  Invitation,
  InvitationChannel,
  InvitationEventType,
  InvitationStatus,
} from 'src/entities/invitation.entity';
import { QueryBuilderHelper } from 'src/utils/queryBuilder.utils';
import { BaseRepository } from './base.repository';

type CreateInvitationPayload = {
  eventType: InvitationEventType;
  drawNameEventId?: string | null;
  wishlistEventId?: string | null;
  giftingEventId?: string | null;
  eventId: string;
  participantId?: string | null;
  eventContactId?: string | null;
  token: string;
  channel: InvitationChannel;
  inviteUrl: string;
  createdById?: string;
};

@Injectable()
export class InvitationRepository extends BaseRepository<Invitation> {
  constructor(
    @InjectDataSource() dataSource: DataSource,
    @InjectRepository(Invitation) repo: Repository<Invitation>,
  ) {
    super(dataSource, repo);
  }

  async createOrReuse(
    payload: CreateInvitationPayload,
  ): Promise<Invitation> {
    const existingInvitation = await this.findReusableInvitation(payload);

    if (existingInvitation) {
      await this.repo.update(existingInvitation.id, {
        channel: payload.channel,
        inviteUrl: existingInvitation.inviteUrl,
        sentAt: new Date(),
      });

      return this.findByIdWithRelations(existingInvitation.id);
    }

    const invitation = await this.repo.save(
      this.repo.create({
        ...payload,
        sentAt: new Date(),
        status: InvitationStatus.PENDING,
      }),
    );

    return this.findByIdWithRelations(invitation.id);
  }

  findByParticipantId(
    participantId: string,
    eventType?: InvitationEventType,
  ): Promise<Invitation | null> {
    const qb = this.repo
      .createQueryBuilder('invitation')
      .where('invitation.participant_id = :participantId', { participantId });

    if (eventType) {
      qb.andWhere('invitation.event_type = :eventType', { eventType });
    }

    return qb.getOne();
  }

  findByEventContactIdForEvent(
    eventId: string,
    eventContactId: string,
    eventType: InvitationEventType,
  ): Promise<Invitation | null> {
    return this.repo.findOne({
      where: {
        eventId,
        eventContactId,
        eventType,
      },
    });
  }

  findByToken(token: string): Promise<Invitation | null> {
    return this.repo
      .createQueryBuilder('invitation')
      .leftJoinAndSelect('invitation.event', 'event')
      .leftJoinAndSelect('invitation.participant', 'participant')
      .leftJoinAndSelect('invitation.eventContact', 'event_contact')
      .select([
        'invitation',
        'event.id',
        'event.title',
        'participant.id',
        'participant.eventId',
        'participant.eventContactId',
        'event_contact.id',
        'event_contact.firstName',
        'event_contact.lastName',
        'event_contact.email',
        'event_contact.phoneNumber',
        'event_contact.userId',
      ])
      .where('invitation.token = :token', { token })
      .getOne();
  }

  async findAllForDrawNameEvent(
    drawNameEventId: string,
    ownerContactId: string,
    query: PaginationDto & { searchQuery?: string },
  ): Promise<PaginatedRecordsDto<Invitation>> {
    return this.findAllForEvent(
      drawNameEventId,
      ownerContactId,
      InvitationEventType.DRAW_NAME,
      query,
      'drawNameEventId',
    );
  }

  async findAllForEvent(
    eventTypeId: string,
    ownerContactId: string,
    eventType: InvitationEventType,
    query: PaginationDto & { searchQuery?: string },
    eventTypeColumn?: 'drawNameEventId' | 'wishlistEventId' | 'giftingEventId',
  ): Promise<PaginatedRecordsDto<Invitation>> {
    const qb = this.repo
      .createQueryBuilder('invitation')
      .innerJoinAndSelect('invitation.event', 'event')
      .leftJoinAndSelect('invitation.participant', 'participant')
      .leftJoinAndSelect('invitation.eventContact', 'event_contact')
      .select([
        'invitation',
        'event.id',
        'event.title',
        'participant.id',
        'participant.eventId',
        'participant.eventContactId',
        'event_contact.id',
        'event_contact.firstName',
        'event_contact.lastName',
        'event_contact.email',
        'event_contact.phoneNumber',
      ])
      .where('invitation.event_type = :eventType', { eventType })
      .andWhere('event.created_by_id = :ownerContactId', { ownerContactId });

    if (eventTypeColumn) {
      qb.andWhere(`invitation.${eventTypeColumn} = :eventTypeId`, {
        eventTypeId,
      });
    } else {
      qb.andWhere('invitation.event_id = :eventTypeId', { eventTypeId });
    }

    if (query.searchQuery) {
      qb.andWhere(
        new Brackets((subQuery) => {
          subQuery.where('event_contact."firstName" ILIKE :searchQuery', {
            searchQuery: `%${query.searchQuery}%`,
          });
          subQuery.orWhere('event_contact."lastName" ILIKE :searchQuery', {
            searchQuery: `%${query.searchQuery}%`,
          });
          subQuery.orWhere('event_contact.email ILIKE :searchQuery', {
            searchQuery: `%${query.searchQuery}%`,
          });
        }),
      );
    }

    const helper = new QueryBuilderHelper(qb);
    helper.applySorting('invitation.createdAt', query.sortOrder);

    return helper.paginate(query);
  }

  async markAccepted(id: string): Promise<Invitation> {
    await this.repo.update(id, {
      status: InvitationStatus.ACCEPTED,
      acceptedAt: new Date(),
    });

    return this.findByIdWithRelations(id);
  }

  async linkParticipant(
    id: string,
    participantId: string,
  ): Promise<Invitation> {
    await this.repo.update(id, { participantId });

    return this.findByIdWithRelations(id);
  }

  private async findByIdWithRelations(id: string): Promise<Invitation> {
    const invitation = await this.repo
      .createQueryBuilder('invitation')
      .leftJoinAndSelect('invitation.event', 'event')
      .leftJoinAndSelect('invitation.participant', 'participant')
      .leftJoinAndSelect('invitation.eventContact', 'event_contact')
      .select([
        'invitation',
        'event.id',
        'event.title',
        'participant.id',
        'participant.eventId',
        'participant.eventContactId',
        'event_contact.id',
        'event_contact.firstName',
        'event_contact.lastName',
        'event_contact.email',
        'event_contact.phoneNumber',
        'event_contact.userId',
      ])
      .where('invitation.id = :id', { id })
      .getOne();

    if (!invitation) {
      throw new Error('InvitationNotFound');
    }

    return invitation;
  }

  private async findReusableInvitation(
    payload: CreateInvitationPayload,
  ): Promise<Invitation | null> {
    if (payload.participantId) {
      return this.findByParticipantId(payload.participantId, payload.eventType);
    }

    if (payload.eventContactId) {
      return this.findByEventContactIdForEvent(
        payload.eventId,
        payload.eventContactId,
        payload.eventType,
      );
    }

    return null;
  }
}
