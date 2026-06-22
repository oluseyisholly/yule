import { Entity, Column, Index, Unique } from 'typeorm';
import { Base } from './base';
import { Gender } from 'src/common/index.enum';

@Entity('contacts')
@Index('IDX_contacts_email_unique', ['email'], { unique: true })
@Index('IDX_contacts_user_id_unique', ['userId'], { unique: true })
@Index(['createdById', 'email'])
@Index(['createdById', 'phoneNumber'])
@Unique(['createdById', 'email'])
export class Contact extends Base {
  /**
   * The platform user who owns this contact.
   * Example: Sola saved John as a contact.
   */

  @Column({ type: 'varchar', length: 255 })
  firstName: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  lastName?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email?: string;

  @Column({
    type: 'enum',
    enum: Gender,
  })
  gender: Gender;
  @Column({ type: 'varchar', length: 50, nullable: true })
  phoneNumber?: string;

  @Column({ name: 'user_id', type: 'varchar', length: 255, nullable: true })
  userId?: string;

  @Column({ type: 'text', nullable: true })
  note?: string;
}
