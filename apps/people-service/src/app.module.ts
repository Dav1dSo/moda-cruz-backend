import { Module } from '@nestjs/common';
import { PeopleModule } from './people/people.module';
import { DatabaseModule } from '@app/database';

@Module({
  imports: [DatabaseModule, PeopleModule],
})
export class AppModule {}
