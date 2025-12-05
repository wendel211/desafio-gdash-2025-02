import { IsOptional, IsNumberString } from 'class-validator';

export class ListQueryDto {
  @IsOptional()
  @IsNumberString()
  limit?: string;

  @IsOptional()
  @IsNumberString()
  offset?: string;
}
