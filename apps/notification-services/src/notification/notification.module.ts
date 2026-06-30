import { Module } from '@nestjs/common';
import { SendResetPasswordEmailUseCase } from './application/use-cases/send-reset-password-email.use-case';
import { SendWelcomeEmailUseCase } from './application/use-cases/send-welcome-email.use-case';
import { EmailService } from './email/email.service';
import { NotificationController } from './notification.controller';

@Module({
  controllers: [NotificationController],
  providers: [
    EmailService,
    SendResetPasswordEmailUseCase,
    SendWelcomeEmailUseCase,
  ],
})
export class NotificationModule {}
