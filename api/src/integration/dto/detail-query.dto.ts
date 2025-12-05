import { IsNotEmpty, IsString } from 'class-validator';

export class DetailQueryDto {
  @IsNotEmpty()
  @IsString()
  name: string;
}
