import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { EventType } from './event-type.entity';
import { EventParticipant } from './event-participant.entity';
import { HangoutEvent } from './hangout-event.entity';
import { GiftingEvent } from './gifting-event.entity';
import { WishlistEvent } from './wishlist-event.entity';
import { DrawNameEvent } from './draw-name-event.entity';
import { Base } from './base';
import { EventLog } from './event-log.entity';

@Entity('events')
export class Event extends Base {
  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @ManyToOne(() => EventType, (eventType) => eventType.events, {
    nullable: false,
  })
  @JoinColumn({ name: 'event_type_id' })
  eventType: EventType;

  @Column({ name: 'event_type_id', type: 'uuid' })
  eventTypeId: string;

  @ManyToOne(() => User, (user) => user.createdEvents, {
    nullable: false,
  })
  @JoinColumn({ name: 'created_by_id' })
  createdBy: User;

  @Column({ type: 'timestamp', nullable: true })
  eventDate?: Date;

  @Column({ type: 'varchar', length: 100, default: 'draft' })
  status: string;

  @OneToMany(() => EventParticipant, (participant) => participant.event)
  participants: EventParticipant[];

  @OneToOne(() => HangoutEvent, (hangoutEvent) => hangoutEvent.event)
  hangoutEvent: HangoutEvent;

  @OneToOne(() => GiftingEvent, (giftingEvent) => giftingEvent.event)
  giftingEvent: GiftingEvent;

  @OneToOne(() => WishlistEvent, (wishlistEvent) => wishlistEvent.event)
  wishlistEvent: WishlistEvent;

  @OneToOne(() => DrawNameEvent, (drawNameEvent) => drawNameEvent.event)
  drawNameEvent: DrawNameEvent;

  @OneToMany(() => EventLog, (log) => log.event)
  logs: EventLog[];
}
