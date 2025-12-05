import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_URI || 'mongodb://mongo:27017/gdash', {
      dbName: process.env.MONGO_DB || 'gdash',
    }),
  ],
})
export class MongoModule {}