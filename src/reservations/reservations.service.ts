import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateAvailabilityDto } from 'src/dto/create-availability.dto';
import { Appointment } from 'src/entities/reservations/appointment.entity';
import { Availability } from 'src/entities/reservations/availability.entity';
import { Provider } from 'src/entities/users/provider.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ReservationsService {
  constructor(
    @InjectRepository(Availability)
    private availabilityRepository: Repository<Availability>,
    @InjectRepository(Appointment)
    private appointmentRespository: Repository<Appointment>,
    @InjectRepository(Provider)
    private providersRepository: Repository<Provider>,
  ) {}

  async createAvailability(
    createAvailabilityDto: CreateAvailabilityDto,
  ): Promise<Availability> {
    const provider = await this.providersRepository.findOne({
      where: { providerId: createAvailabilityDto.providerId },
    });
    if (!provider) {
      throw new Error(
        `Provider with id: ${createAvailabilityDto.providerId} does not exist`,
      );
    }
    const availability = this.availabilityRepository.create({
      ...createAvailabilityDto,
      provider,
    });
    await this.availabilityRepository.save(availability);
    return availability;
  }
}
