import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { Event } from './event.entity';

@Entity('gifting_events')
export class GiftingEvent {
  @PrimaryColumn({ name: 'event_id', type: 'uuid' })
  eventId: string;

  @OneToOne(() => Event, (event) => event.giftingEvent, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'event_id' })
  event: Event;

  @Column({ type: 'numeric', precision: 12, scale: 2, nullable: true })
  giftBudget?: number;

  @Column({ type: 'varchar', length: 10, default: 'NGN' })
  currency: string;

  @Column({ type: 'timestamp', nullable: true })
  giftDeadline?: Date;

  @Column({ type: 'boolean', default: false })
  allowAnonymousGifting: boolean;
}
