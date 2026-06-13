import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { Event } from './event.entity';
import { Base } from './base';
import { Contact } from './contact.entity';
import { EventGift } from './gift.entity';

export enum EventParticipantRole {
  CREATOR = 'creator',
  HOST = 'host',
  CO_HOST = 'co_host',
  PARTICIPANT = 'participant',
}

@Entity('event_participants')
export class EventParticipant extends Base {
  @ManyToOne(() => Event, (event) => event.participants, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'event_id' })
  event: Event;

  @Column({ name: 'event_id', type: 'uuid' })
  eventId: string;

  @ManyToOne(() => Contact, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'event_contact_id' })
  eventContact?: Contact;

  @Column({ name: 'event_contact_id', type: 'uuid', nullable: true })
  eventContactId?: string;

  /**
   * This is the participant assigned to give this participant a gift.
   *
   * Example:
   * Mary is the receiver.
   * John is the giver.
   *
   * Mary's row:
   * giftGiverParticipantId = John's participant id
   */
  @Column({
    name: 'gift_giver_participant_id',
    type: 'uuid',
    nullable: true,
  })
  giftGiverParticipantId?: string;

  @ManyToOne(() => EventParticipant, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'gift_giver_participant_id' })
  giftGiverParticipant?: EventParticipant;

  @Column({
    type: 'enum',
    enum: EventParticipantRole,
    default: EventParticipantRole.PARTICIPANT,
  })
  role: EventParticipantRole;

  @Column({ name: 'is_notified', type: 'boolean', default: false })
  isNotified: boolean;

  @Column({ name: 'is_pair_active', type: 'boolean', default: false })
  isPairActive: boolean;

  @OneToMany(() => EventGift, (gift) => gift.recipientParticipant)
  gifts: EventGift[];
}
