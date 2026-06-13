import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Base } from './base';
import { Event } from './event.entity';
import { EventParticipant } from './event-participant.entity';

@Entity('event_gifts')
export class EventGift extends Base {
  @ManyToOne(() => Event, (event) => event.gifts, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'event_id' })
  event: Event;

  @Column({ name: 'event_id', type: 'uuid' })
  eventId: string;

  /**
   * The participant this gift belongs to.
   * This is the person receiving the gift.
   */
  @ManyToOne(() => EventParticipant, (participant) => participant.gifts, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'recipient_participant_id' })
  recipientParticipant?: EventParticipant;

  @Column({ name: 'recipient_participant_id', type: 'uuid', nullable: true })
  recipientParticipantId?: string;

  /**
   * Optional: the participant giving/buying the gift.
   * Useful for draw name / secret santa.
   */
  @ManyToOne(() => EventParticipant, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'giver_participant_id' })
  giverParticipant?: EventParticipant;

  @Column({ name: 'giver_participant_id', type: 'uuid', nullable: true })
  giverParticipantId?: string;

  @Column({ name: 'participant_gift_id', type: 'varchar', length: 255 })
  participantGiftId: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'numeric',
    precision: 12,
    scale: 2,
  })
  amount: number;

  @Column({ type: 'varchar', length: 10, default: 'NGN' })
  currency: string;

  @Column({ name: 'image_url', type: 'text', nullable: true })
  imageUrl?: string;

  @Column({
    name: 'category_slug',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  categorySlug?: string;

  @Column({
    name: 'sub_category_slug',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  subCategorySlug?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  condition?: string;

  @Column({
    name: 'location_state',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  locationState?: string;

  @Column({
    name: 'location_city',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  locationCity?: string;

  @Column({ name: 'seller_id', type: 'varchar', length: 255, nullable: true })
  sellerId?: string;

  @Column({
    name: 'product_slug',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  productSlug?: string;
}
