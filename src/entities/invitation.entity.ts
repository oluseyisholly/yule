import { Column, Entity, Index, JoinColumn, ManyToOne, Unique } from 'typeorm';
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

@Entity('invitations')
@Index(['token'], { unique: true })
@Unique(['participantId'])
export class Invitation extends Base {
  @Column({ name: 'draw_name_event_id', type: 'uuid' })
  drawNameEventId: string;

  @ManyToOne(() => Event, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'event_id' })
  event: Event;

  @Column({ name: 'event_id', type: 'uuid' })
  eventId: string;

  @ManyToOne(() => EventParticipant, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'participant_id' })
  participant: EventParticipant;

  @Column({ name: 'participant_id', type: 'uuid' })
  participantId: string;

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
