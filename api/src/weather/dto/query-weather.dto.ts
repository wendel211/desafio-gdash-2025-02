import { IsOptional, IsDateString } from 'class-validator';

export class QueryWeatherDto {
  @IsOptional() @IsDateString() start?: string;
  @IsOptional() @IsDateString() end?: string;
}
