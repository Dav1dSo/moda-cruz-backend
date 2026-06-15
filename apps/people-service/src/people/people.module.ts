import { Module } from '@nestjs/common';
import { ApplicationModule } from './application/application.module';
import { MessagingModule } from './messaging/messaging.module';

@Module({
  imports: [ApplicationModule, MessagingModule],
})
export class PeopleModule {}
