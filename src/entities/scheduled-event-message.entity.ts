import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Base } from './base';
import { Event } from './event.entity';
import { EventParticipant } from './event-participant.entity';

export enum ScheduledEventMessageStatus {
  PENDING = 'pending',
  SENT = 'sent',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum ScheduledEventMessageType {
  INVITATION = 'invitation',
  REMINDER = 'reminder',
  GIFT_CLAIM = 'gift_claim',
  THANK_YOU = 'thank_you',
  CUSTOM = 'custom',
}

@Entity('scheduled_event_messages')
export class ScheduledEventMessage extends Base {
  @ManyToOne(() => Event, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'event_id' })
  event: Event;

  @Column({ name: 'event_id', type: 'uuid' })
  eventId: string;

  /**
   * Optional.
   * Use this when the message is meant for one specific participant.
   * Leave null if the message is for all event participants.
   */
  @ManyToOne(() => EventParticipant, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'participant_id' })
  participant?: EventParticipant;

  @Column({ name: 'participant_id', type: 'uuid', nullable: true })
  participantId?: string;

  @Column({ type: 'varchar', length: 255 })
  subject: string;

  @Column({ type: 'text' })
  message: string;

  /**
   * The email to send to.
   * Useful because participants may be guests without platform accounts.
   */
  @Column({ name: 'recipient_email', type: 'varchar', length: 255 })
  recipientEmail: string;

  @Column({
    name: 'recipient_name',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  recipientName?: string;

  /**
   * The date/time the email should be sent.
   */
  @Column({ name: 'scheduled_at', type: 'timestamptz' })
  scheduledAt: Date;

  /**
   * When the system actually sent the email.
   */
  @Column({ name: 'sent_at', type: 'timestamptz', nullable: true })
  sentAt?: Date;

  @Column({
    type: 'enum',
    enum: ScheduledEventMessageStatus,
    default: ScheduledEventMessageStatus.PENDING,
  })
  status: ScheduledEventMessageStatus;

  /**
   * Optional gift URL.
   * Example: link to claim gift, view wishlist, redeem voucher, etc.
   */
  @Column({ name: 'gift_url', type: 'text', nullable: true })
  giftUrl?: string;

  /**
   * Optional expiry date for the gift URL.
   */
  @Column({ name: 'gift_url_expires_at', type: 'timestamptz', nullable: true })
  giftUrlExpiresAt?: Date;

  /**
   * Useful for storing email provider response, template data, failure reason, etc.
   */
  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @Column({ name: 'failure_reason', type: 'text', nullable: true })
  failureReason?: string;
}
