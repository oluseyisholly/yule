import { Entity, Column, Index, OneToMany } from 'typeorm';
import { Event } from './event.entity';
import { Base } from './base';

@Entity('event_types')
@Index('IDX_event_types_created_by_name_unique', ['createdById', 'name'], {
  unique: true,
})
@Index('IDX_event_types_global_name_unique', ['name'], {
  unique: true,
  where: '"created_by_id" IS NULL',
})
export class EventType extends Base {
  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 100, nullable: true, unique: true })
  key: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @OneToMany(() => Event, (event) => event.eventType)
  events: Event[];
}
