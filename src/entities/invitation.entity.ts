import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { Base } from './base';
import { Contact } from './contact.entity';
import { Event } from './event.entity';
import { EventParticipant } from './event-participant.entity';

export enum InvitationStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
}

export enum InvitationChannel {
  EMAIL = 'email',
  WHATSAPP = 'whatsapp',
}

export enum InvitationEventType {
  DRAW_NAME = 'draw_name',
  WISHLIST = 'wishlist',
  GIFTING = 'gifting',
}

@Entity('invitations')
@Index(['token'], { unique: true })
@Index(['participantId', 'eventType'], {
  unique: true,
  where: '"participant_id" IS NOT NULL',
})
@Index(['eventId', 'eventContactId', 'eventType'], {
  unique: true,
  where: '"event_contact_id" IS NOT NULL',
})
export class Invitation extends Base {
  @Column({
    name: 'event_type',
    type: 'enum',
    enum: InvitationEventType,
    default: InvitationEventType.DRAW_NAME,
  })
  eventType: InvitationEventType;

  @Column({ name: 'draw_name_event_id', type: 'uuid', nullable: true })
  drawNameEventId?: string | null;

  @Column({ name: 'wishlist_event_id', type: 'uuid', nullable: true })
  wishlistEventId?: string | null;

  @Column({ name: 'gifting_event_id', type: 'uuid', nullable: true })
  giftingEventId?: string | null;

  @ManyToOne(() => Event, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'event_id' })
  event: Event;

  @Column({ name: 'event_id', type: 'uuid' })
  eventId: string;

  @ManyToOne(() => EventParticipant, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'participant_id' })
  participant?: EventParticipant | null;

  @Column({ name: 'participant_id', type: 'uuid', nullable: true })
  participantId?: string | null;

  @ManyToOne(() => Contact, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'event_contact_id' })
  eventContact?: Contact | null;

  @Column({ name: 'event_contact_id', type: 'uuid', nullable: true })
  eventContactId?: string | null;

  @Column({ type: 'varchar', length: 128, unique: true })
  token: string;

  @Column({
    type: 'enum',
    enum: InvitationStatus,
    default: InvitationStatus.PENDING,
  })
  status: InvitationStatus;

  @Column({
    type: 'enum',
    enum: InvitationChannel,
    default: InvitationChannel.EMAIL,
  })
  channel: InvitationChannel;

  @Column({ name: 'invite_url', type: 'text' })
  inviteUrl: string;

  @Column({ name: 'sent_at', type: 'timestamptz', nullable: true })
  sentAt?: Date | null;

  @Column({ name: 'accepted_at', type: 'timestamptz', nullable: true })
  acceptedAt?: Date | null;
}
