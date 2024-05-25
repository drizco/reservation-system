import { Body, Controller, Post } from '@nestjs/common';
import { CreateAvailabilityDto } from 'src/dto/create-availability.dto';
import { ReservationsService } from './reservations.service';

@Controller('availability')
export class AvailabilityController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post()
  async createAvailability(
    @Body() createAvailabilityDto: CreateAvailabilityDto,
  ) {
    return this.reservationsService.createAvailability(createAvailabilityDto);
  }
}
