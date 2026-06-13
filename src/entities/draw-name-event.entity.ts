import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { Event } from './event.entity';
import { Base } from './base';
import { Exclude } from 'class-transformer';

@Entity('draw_name_events')
export class DrawNameEvent extends Base {
  @PrimaryColumn({ name: 'event_id', type: 'uuid' })
  eventId: string;

  @OneToOne(() => Event, (event) => event.drawNameEvent, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'event_id' })
  event: Event;

  @Column({ type: 'varchar', length: 255, nullable: true })
  location?: string;

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

  @Column({
    name: 'budget',
    type: 'numeric',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  budget?: number;

  @Exclude()
  @Column({ type: 'boolean', default: false })
  allowSelfDraw: boolean;

  @Column({ type: 'boolean', default: false })
  isDrawCompleted: boolean;
}
