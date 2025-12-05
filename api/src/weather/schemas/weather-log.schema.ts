import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class WeatherLog {
  @Prop() temperature: number;
  @Prop() humidity: number;
  @Prop() wind_speed: number;
  @Prop() condition: string;
  @Prop() timestamp: Date;
}

export type WeatherLogDocument = WeatherLog & Document;
export const WeatherLogSchema = SchemaFactory.createForClass(WeatherLog);
