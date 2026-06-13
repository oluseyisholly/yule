// user.entity.ts – ROOT (no groupId)
import { Entity, Column } from 'typeorm';
import { Base } from './base';
import { Exclude } from 'class-transformer';

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
  @Exclude()
  password: string;
}
