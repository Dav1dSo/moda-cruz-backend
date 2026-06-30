import { Module } from '@nestjs/common';
import { EmailService } from '../email/email.service';
import { SendEmailUseCase } from '../application/use-cases/send-email.use-case';
import { NotificationController } from './notification.controller';

@Module({
  controllers: [NotificationController],
  providers: [EmailService, SendEmailUseCase],
})
export class MessagingModule {}
