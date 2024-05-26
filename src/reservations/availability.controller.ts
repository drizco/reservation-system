import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
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

  @Get(':providerId')
  async getAvailability(
    @Param('providerId') providerId: number,
    @Query('startDate') startDate?: string,
    @Query('numDays') numDays?: number,
  ) {
    return this.reservationsService.getAvailability({
      providerId,
      startDate,
      numDays,
    });
  }
}
