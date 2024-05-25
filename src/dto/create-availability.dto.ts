import { IsDateString, IsNumber } from 'class-validator';

export class CreateAvailabilityDto {
  @IsDateString()
  date: string;

  @IsDateString()
  startTime: string;

  @IsDateString()
  endTime: string;

  @IsNumber()
  providerId: number;
}
