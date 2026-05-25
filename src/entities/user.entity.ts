// user.entity.ts – ROOT (no groupId)
import { Entity, Column, OneToMany } from 'typeorm';
import { Event } from './event.entity';
import { EventParticipant } from './event-participant.entity';
import { Base } from './base';

@Entity('users')
export class User extends Base {
  @Column({ type: 'varchar', length: 150 })
  firstName: string;

  @Column({ type: 'varchar', length: 150 })
  lastName: string;

  @Column({ type: 'varchar', length: 20 })
  phoneNumber: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @OneToMany(() => Event, (event) => event.createdBy)
  createdEvents: Event[];

  @OneToMany(() => EventParticipant, (participant) => participant.user)
  eventParticipations: EventParticipant[];
}
