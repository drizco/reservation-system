import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';
import { Provider } from '../users/provider.entity';
import { Appointment } from './appointment.entity';

@Entity({ name: 'availability' })
export class Availability {
  @PrimaryGeneratedColumn()
  availabilityId: number;

  @Column('date')
  date: Date;

  @Column('timestamptz')
  startTime: Date;

  @Column('timestamptz')
  endTime: Date;

  @OneToMany(() => Appointment, (appointment) => appointment.availability, {
    onDelete: 'CASCADE',
  })
  appointments: Relation<Appointment>[];

  @ManyToOne(() => Provider, (provider) => provider.availability, {
    onDelete: 'CASCADE',
  })
  provider: Relation<Provider>;
}
