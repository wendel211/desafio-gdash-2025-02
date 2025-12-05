import { IsNumber, IsString, IsDateString } from 'class-validator';

export class CreateWeatherDto {
  @IsNumber() temperature: number;
  @IsNumber() humidity: number;
  @IsNumber() wind_speed: number;
  @IsString() condition: string;

  @IsDateString()
  timestamp: string;
}
