import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Event } from './event.entity';
import { User } from './user.entity';
import { Base } from './base';

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

  /**
   * Nullable because guest participants may not have an account.
   */
  @ManyToOne(() => User, (user) => user.eventParticipations, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId?: string;

  @Column({
    type: 'enum',
    enum: EventParticipantRole,
    default: EventParticipantRole.PARTICIPANT,
  })
  role: EventParticipantRole;

  @Column({ type: 'varchar', length: 100, default: 'invited' })
  status: string;

  @Column({ type: 'boolean', default: false })
  hasAcceptedInvite: boolean;
}
