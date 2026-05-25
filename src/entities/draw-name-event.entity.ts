import {
  Entity,
  PrimaryColumn,
  Column,
  OneToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Event } from './event.entity';
import { DrawNameAssignment } from './draw-name-assignment.entity';
import { Base } from './base';

@Entity('draw_name_events')
export class DrawNameEvent extends Base {
  @PrimaryColumn({ name: 'event_id', type: 'uuid' })
  eventId: string;

  @OneToOne(() => Event, (event) => event.drawNameEvent, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'event_id' })
  event: Event;

  @Column({ type: 'timestamp', nullable: true })
  drawDate?: Date;

  @Column({
    name: 'maximum_spend',
    type: 'numeric',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  maximumSpend?: number;

  @Column({ type: 'boolean', default: false })
  allowSelfDraw: boolean;

  @Column({ type: 'boolean', default: false })
  isDrawCompleted: boolean;

  @OneToMany(() => DrawNameAssignment, (assignment) => assignment.drawNameEvent)
  assignments: DrawNameAssignment[];
}
