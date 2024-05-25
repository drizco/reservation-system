import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';
import { Appointment } from '../reservations/appointment.entity';
import { Availability } from '../reservations/availability.entity';
import { User } from './user.entity';

@Entity({ name: 'providers' })
export class Provider {
  @PrimaryGeneratedColumn()
  providerId: number;

  @Column()
  license: string;

  @Column()
  state: string;

  @OneToMany(() => Availability, (availability) => availability.provider)
  availability: Relation<Availability>[];

  @OneToMany(() => Appointment, (appointment) => appointment.provider)
  appointments: Relation<Appointment>[];

  @OneToOne(() => User)
  @JoinColumn()
  user: Relation<User>;
}
