import { Entity, Column, Index, OneToMany } from 'typeorm';
import { Base } from './base';
import { GiftingEvent } from './gifting-event.entity';

@Entity('relationships')
@Index('IDX_relationships_created_by_name_unique', ['createdById', 'name'], {
  unique: true,
})
@Index('IDX_relationships_global_name_unique', ['name'], {
  unique: true,
  where: '"created_by_id" IS NULL',
})
export class Relationship extends Base {
  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @OneToMany(() => GiftingEvent, (giftingEvent) => giftingEvent.relationship)
  giftingEvents: GiftingEvent[];
}
