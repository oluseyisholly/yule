import {
  Entity,
  PrimaryColumn,
  Column,
  OneToOne,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { Event } from './event.entity';
import { Base } from './base';
import { Relationship } from './relationship.entity';

@Entity('gifting_events')
export class GiftingEvent extends Base {
  @PrimaryColumn({ name: 'event_id', type: 'uuid' })
  eventId: string;

  @OneToOne(() => Event, (event) => event.giftingEvent, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'event_id' })
  event: Event;

  @Column({
    name: 'minimum_gift_budget',
    type: 'numeric',
    precision: 15,
    scale: 2,
    nullable: true,
  })
  minimumGiftBudget?: number;

  @Column({
    name: 'maximum_gift_budget',
    type: 'numeric',
    precision: 15,
    scale: 2,
    nullable: true,
  })
  maximumGiftBudget?: number;

  @Column({ type: 'varchar', length: 10, default: 'NGN' })
  currency: string;

  @Column({ type: 'timestamp', nullable: true })
  giftDeadline?: Date;

  @Column({ type: 'boolean', default: false })
  allowAnonymousGifting: boolean;

  @ManyToOne(() => Relationship, (relationship) => relationship.giftingEvents, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'relationship_id' })
  relationship?: Relationship | null;

  @Column({ name: 'relationship_id', type: 'uuid', nullable: true })
  relationshipId?: string | null;
}
