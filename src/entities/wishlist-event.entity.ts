import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { Event } from './event.entity';
import { Base } from './base';

@Entity('wishlist_events')
export class WishlistEvent extends Base {
  @PrimaryColumn({ name: 'event_id', type: 'uuid' })
  eventId: string;

  @OneToOne(() => Event, (event) => event.wishlistEvent, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'event_id' })
  event: Event;

  @Column({ type: 'boolean', default: true })
  allowMultipleItems: boolean;

  @Column({ type: 'timestamp', nullable: true })
  eventDeadline?: Date;

  @Column({ type: 'varchar', length: 50, default: 'private' })
  visibility: string;

}
