import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { Event } from './event.entity';
import { Base } from './base';

@Entity('hangout_events')
export class HangoutEvent extends Base {
  @PrimaryColumn({ name: 'event_id', type: 'uuid' })
  eventId: string;

  @OneToOne(() => Event, (event) => event.hangoutEvent, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'event_id' })
  event: Event;

  @Column({ type: 'text', nullable: true })
  location?: string;

  @Column({
    name: 'hangout_event_id',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  hangoutEventId?: string;

  @Column({
    name: 'event_center_name',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  eventCenterName?: string;

  @Column({ name: 'check_in_date', type: 'timestamp', nullable: true })
  checkInDate?: Date;

  @Column({ name: 'check_out_date', type: 'timestamp', nullable: true })
  checkOutDate?: Date;

  @Column({ name: 'number_of_guests', type: 'int', nullable: true })
  numberOfGuests?: number;

  @Column({
    type: 'numeric',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  amount?: number;

  @Column({ name: 'image_url', type: 'text', nullable: true })
  imageUrl?: string;

  @Column({ type: 'int', nullable: true })
  maxAttendees?: number;

  @Column({ type: 'boolean', default: false })
  allowPlusOne: boolean;
}
