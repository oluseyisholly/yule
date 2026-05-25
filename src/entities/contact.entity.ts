import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Base } from './base';
import { User } from './user.entity';

@Entity('contacts')
@Index(['ownerUserId', 'email'])
@Index(['ownerUserId', 'phone'])
export class Contact extends Base {
  /**
   * The platform user who owns this contact.
   * Example: Sola saved John as a contact.
   */
  @ManyToOne(() => User, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'owner_user_id' })
  ownerUser: User;

  @Column({ name: 'owner_user_id', type: 'uuid' })
  ownerUserId: string;

  @Column({ name: 'display_name', type: 'varchar', length: 255 })
  displayName: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  phone?: string;

  @Column({ type: 'text', nullable: true })
  note?: string;
}
