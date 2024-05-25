import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  Relation,
  TableInheritance,
} from 'typeorm';
import { Client } from './client.entity';
import { Provider } from './provider.entity';

export enum UserType {
  CLIENT = 'client',
  PROVIDER = 'provider',
}

@Entity({ name: 'users' })
@TableInheritance({ column: { type: 'varchar', name: 'type' } })
export class User {
  @PrimaryGeneratedColumn()
  userId: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  email: string;

  @Column({ type: 'varchar' })
  userType: UserType;

  @OneToOne(() => Provider, { nullable: true })
  @JoinColumn()
  provider: Relation<Provider>;

  @OneToOne(() => Client, { nullable: true })
  @JoinColumn()
  client: Relation<Client>;
}
