import { Column, Entity, Index, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { Base } from './base';
import { Event } from './event.entity';
import { EventParticipant } from './event-participant.entity';

@Entity('event_participant_exclusions')
@Index(['eventId', 'participantOneId'])
@Index(['eventId', 'participantTwoId'])
@Unique(['eventId', 'participantOneId', 'participantTwoId'])
export class EventParticipantExclusion extends Base {
  @ManyToOne(() => Event, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'event_id' })
  event: Event;

  @Column({ name: 'event_id', type: 'uuid' })
  eventId: string;

  @ManyToOne(() => EventParticipant, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'participant_one_id' })
  participantOne: EventParticipant;

  @Column({ name: 'participant_one_id', type: 'uuid' })
  participantOneId: string;

  @ManyToOne(() => EventParticipant, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'participant_two_id' })
  participantTwo: EventParticipant;

  @Column({ name: 'participant_two_id', type: 'uuid' })
  participantTwoId: string;
}
