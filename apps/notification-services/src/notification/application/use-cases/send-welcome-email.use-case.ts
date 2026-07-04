import { Injectable } from '@nestjs/common';
import type { UserCreatedEvent } from '@contracts/users/user-created.event';
import { EmailService } from '../../email/email.service';
import { welcomeUserTemplate } from '../../email/templates/welcome-user-template-email';

@Injectable()
export class SendWelcomeEmailUseCase {
  constructor(private readonly emailService: EmailService) {}

  async execute(event: UserCreatedEvent): Promise<void> {
    await this.emailService.sendEmail(
      event.email,
      'Bem-vindo à nossa plataforma',
      welcomeUserTemplate(event.name, new Date().getFullYear()),
    );
  }
}
