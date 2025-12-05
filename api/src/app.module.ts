import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { MongoModule } from './database/mongo.module';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { WeatherModule } from './weather/weather.module';
import { InsightsModule } from './insights/insights.module';
import { IntegrationModule } from './integration/integration.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongoModule,
    AuthModule,
    UsersModule,
    WeatherModule,
    InsightsModule,
    IntegrationModule,
  ],
})
export class AppModule {}
