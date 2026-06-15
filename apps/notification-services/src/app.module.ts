import { Module } from '@nestjs/common';
import { PeopleModule } from './notification/people.module';
import { DatabaseModule } from '@app/database';

@Module({
  imports: [DatabaseModule, PeopleModule],
})
export class AppModule {}
