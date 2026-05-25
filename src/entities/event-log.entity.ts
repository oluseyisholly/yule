import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Event } from './event.entity';
import { EventParticipant } from './event-participant.entity';
import { User } from './user.entity';
import { EventLogAction } from 'src/common/index.enum';
import { Base } from './base';

@Entity('event_logs')
export class EventLog extends Base {
  @ManyToOne(() => Event, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'event_id' })
  event: Event;

  @Column({ name: 'event_id', type: 'uuid' })
  eventId: string;

  /**
   * The logged-in user who performed the action.
   * Nullable because some actions may be system-generated.
   */
  @ManyToOne(() => User, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'actor_user_id' })
  actorUser?: User;

  @Column({ name: 'actor_user_id', type: 'uuid', nullable: true })
  actorUserId?: string;

  /**
   * Useful when the actor is a participant/guest instead of a platform user.
   */
  @ManyToOne(() => EventParticipant, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'actor_participant_id' })
  actorParticipant?: EventParticipant;

  @Column({ name: 'actor_participant_id', type: 'uuid', nullable: true })
  actorParticipantId?: string;

  @Column({
    type: 'enum',
    enum: EventLogAction,
  })
  action: EventLogAction;

  /**
   * Human-readable title shown in UI.
   * Example: "Event Created"
   */
  @Column({ type: 'varchar', length: 255 })
  title: string;

  /**
   * Optional extra message.
   * Example: "John Doe added Mary as a participant"
   */
  @Column({ type: 'text', nullable: true })
  description?: string;

  /**
   * Optional reference to another record.
   * Example: participantId, wishlistItemId, giftItemId, etc.
   */
  @Column({ name: 'target_id', type: 'uuid', nullable: true })
  targetId?: string;

  /**
   * Optional target type.
   * Example: "participant", "wishlist_item", "gift_item"
   */
  @Column({ name: 'target_type', type: 'varchar', length: 100, nullable: true })
  targetType?: string;

  /**
   * Flexible extra data.
   * PostgreSQL jsonb is useful here.
   */
  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;
}
