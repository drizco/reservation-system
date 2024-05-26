import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';
import { Client } from '../users/client.entity';
import { Provider } from '../users/provider.entity';
import { Availability } from './availability.entity';

@Entity({ name: 'appointments' })
export class Appointment {
  @PrimaryGeneratedColumn()
  appointmentId: number;

  @Column('timestamptz')
  appointmentTime: Date;

  @Column({ default: false })
  confirmed: boolean;

  @ManyToOne(() => Client, (client) => client.appointments, {
    onDelete: 'CASCADE',
  })
  client: Relation<Client>;

  @ManyToOne(() => Provider, (provider) => provider.appointments, {
    onDelete: 'CASCADE',
  })
  provider: Relation<Provider>;

  @ManyToOne(() => Availability, (availability) => availability.appointments, {
    onDelete: 'CASCADE',
  })
  availability: Relation<Availability>;
}
