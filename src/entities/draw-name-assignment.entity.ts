import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
  CreateDateColumn,
  Check,
} from 'typeorm';
import { DrawNameEvent } from './draw-name-event.entity';
import { EventParticipant } from './event-participant.entity';
import { Base } from './base';

@Entity('draw_name_assignments')
@Check(`"giver_participant_id" <> "receiver_participant_id"`)
export class DrawNameAssignment extends Base {
  @ManyToOne(
    () => DrawNameEvent,
    (drawNameEvent) => drawNameEvent.assignments,
    {
      nullable: false,
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'event_id' })
  drawNameEvent: DrawNameEvent;

  @Column({ name: 'event_id', type: 'uuid' })
  eventId: string;

  @ManyToOne(() => EventParticipant, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'giver_participant_id' })
  giverParticipant: EventParticipant;

  @Column({ name: 'giver_participant_id', type: 'uuid' })
  giverParticipantId: string;

  @ManyToOne(() => EventParticipant, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'receiver_participant_id' })
  receiverParticipant: EventParticipant;

  @Column({ name: 'receiver_participant_id', type: 'uuid' })
  receiverParticipantId: string;
}
