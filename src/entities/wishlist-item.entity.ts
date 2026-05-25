import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { WishlistEvent } from './wishlist-event.entity';
import { Base } from './base';

@Entity('wishlist_items')
export class WishlistItem extends Base {
  @ManyToOne(() => WishlistEvent, (wishlistEvent) => wishlistEvent.items, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'event_id' })
  wishlistEvent: WishlistEvent;

  @Column({ name: 'event_id', type: 'uuid' })
  eventId: string;

  @Column({ type: 'varchar', length: 255 })
  itemName: string;

  @Column({ type: 'text', nullable: true })
  itemUrl?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'numeric', precision: 12, scale: 2, nullable: true })
  estimatedPrice?: number;

  @Column({ type: 'boolean', default: false })
  isReserved: boolean;
}
