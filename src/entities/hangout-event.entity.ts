import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { Event } from './event.entity';

@Entity('hangout_events')
export class HangoutEvent {
  @PrimaryColumn({ name: 'event_id', type: 'uuid' })
  eventId: string;

  @OneToOne(() => Event, (event) => event.hangoutEvent, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'event_id' })
  event: Event;

  @Column({ type: 'text', nullable: true })
  location?: string;

  @Column({ type: 'int', nullable: true })
  maxAttendees?: number;

  @Column({ type: 'boolean', default: false })
  allowPlusOne: boolean;
}
