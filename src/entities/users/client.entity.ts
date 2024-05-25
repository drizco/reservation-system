import {
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';
import { Appointment } from '../reservations/appointment.entity';
import { User } from './user.entity';

@Entity({ name: 'clients' })
export class Client {
  @PrimaryGeneratedColumn()
  clientId: number;

  @OneToMany(() => Appointment, (appointment) => appointment.client)
  appointments: Relation<Appointment>[];

  @OneToOne(() => User)
  @JoinColumn()
  user: Relation<User>;
}
