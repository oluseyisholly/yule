import {
  Entity,
  PrimaryColumn,
  Column,
  OneToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Event } from './event.entity';
import { WishlistItem } from './wishlist-item.entity';

@Entity('wishlist_events')
export class WishlistEvent {
  @PrimaryColumn({ name: 'event_id', type: 'uuid' })
  eventId: string;

  @OneToOne(() => Event, (event) => event.wishlistEvent, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'event_id' })
  event: Event;

  @Column({ type: 'boolean', default: true })
  allowMultipleItems: boolean;

  @Column({ type: 'varchar', length: 50, default: 'private' })
  visibility: string;

  @OneToMany(() => WishlistItem, (item) => item.wishlistEvent)
  items: WishlistItem[];
}
