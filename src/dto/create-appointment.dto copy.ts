import { IsDateString, IsNumber } from 'class-validator';

export class CreateAppointmentDto {
  @IsNumber()
  availabilityId: number;

  @IsNumber()
  providerId: number;

  @IsNumber()
  clientId: number;

  @IsDateString()
  appointmentTime: string;
}
