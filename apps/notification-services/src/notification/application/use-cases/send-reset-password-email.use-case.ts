import { Injectable } from '@nestjs/common';
import type { ResetPasswordRequestedEvent } from '@contracts/auth/reset-password-requested.event';
import { EmailService } from '../../email/email.service';
import { resetPasswordTemplate } from '../../email/templates/reset-password-template-email';

@Injectable()
export class SendResetPasswordEmailUseCase {
  constructor(private readonly emailService: EmailService) {}

  async execute(event: ResetPasswordRequestedEvent): Promise<void> {
    await this.emailService.sendEmail(
      event.to,
      'Recuperação de senha',
      resetPasswordTemplate(event.name, event.resetLink),
    );
  }
}
