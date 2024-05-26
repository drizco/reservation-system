import { Body, Controller, Param, Patch, Post } from '@nestjs/common';
import { CreateAppointmentDto } from 'src/dto/create-appointment.dto copy';
import { ReservationsService } from './reservations.service';

@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post()
  async createAppointment(@Body() createAppointmentDto: CreateAppointmentDto) {
    return this.reservationsService.createAppointment(createAppointmentDto);
  }

  @Patch(':appointmentId/confirm')
  async confirmAppointment(@Param('appointmentId') appointmentId: number) {
    return this.reservationsService.confirmAppointment(appointmentId);
  }
}
