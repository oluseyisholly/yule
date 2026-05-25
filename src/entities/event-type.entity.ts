import { Entity, Column, OneToMany } from 'typeorm';
import { Event } from './event.entity';
import { Base } from './base';

@Entity('event_types')
export class EventType extends Base {
  @Column({ type: 'varchar', length: 100, unique: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'user_id', type: 'varchar', length: 255, nullable: false })
  userId?: string;

  @OneToMany(() => Event, (event) => event.eventType)
  events: Event[];
}
