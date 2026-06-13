import { Column, Entity, Index, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { Base } from './base';
import { Contact } from './contact.entity';

@Entity('contact_connections')
@Index(['ownerContactId'])
@Index(['contactId'])
@Unique(['ownerContactId', 'contactId'])
export class ContactConnection extends Base {
  @ManyToOne(() => Contact, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'owner_contact_id' })
  ownerContact: Contact;

  @Column({ name: 'owner_contact_id', type: 'uuid' })
  ownerContactId: string;

  @ManyToOne(() => Contact, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'contact_id' })
  contact: Contact;

  @Column({ name: 'contact_id', type: 'uuid' })
  contactId: string;
}
