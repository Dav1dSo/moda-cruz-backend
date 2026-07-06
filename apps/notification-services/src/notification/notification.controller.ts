import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { RESET_PASSWORD_REQUESTED_EVENT } from '@contracts/auth/reset-password-requested.event';
import type { ResetPasswordRequestedEvent } from '@contracts/auth/reset-password-requested.event';
import { USER_CREATED_EVENT } from '@contracts/users/user-created.event';
import type { UserCreatedEvent } from '@contracts/users/user-created.event';
import { SendResetPasswordEmailUseCase } from './application/use-cases/send-reset-password-email.use-case';
import { SendWelcomeEmailUseCase } from './application/use-cases/send-welcome-email.use-case';

@Controller()
export class NotificationController {
  constructor(
    private readonly sendResetPasswordEmailUseCase: SendResetPasswordEmailUseCase,
    private readonly sendWelcomeEmailUseCase: SendWelcomeEmailUseCase,
  ) {}

  @EventPattern(RESET_PASSWORD_REQUESTED_EVENT)
  async sendResetPasswordEmail(
    @Payload() event: ResetPasswordRequestedEvent,
  ): Promise<void> {
    await this.sendResetPasswordEmailUseCase.execute(event);
  }

  @EventPattern(USER_CREATED_EVENT)
  async sendWelcomeEmail(@Payload() event: UserCreatedEvent): Promise<void> {
    await this.sendWelcomeEmailUseCase.execute(event);
  }
}
