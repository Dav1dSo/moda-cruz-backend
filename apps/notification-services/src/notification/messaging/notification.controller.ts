import { Controller } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { RESET_PASSWORD_REQUESTED_EVENT } from '@contracts/auth/reset-password-requested.event';
import type { ResetPasswordRequestedEvent } from '@contracts/auth/reset-password-requested.event';
import { SendEmailUseCase } from '../application/use-cases/send-email.use-case';

@Controller()
export class NotificationController {
  constructor(private readonly sendEmailUseCase: SendEmailUseCase) {}

  @EventPattern(RESET_PASSWORD_REQUESTED_EVENT)
  async sendEmail(
    @Payload() event: ResetPasswordRequestedEvent,
    @Ctx() context: RmqContext,
  ): Promise<void> {
    const channel = context.getChannelRef();
    const message = context.getMessage();

    try {
      await this.sendEmailUseCase.execute(event);
      channel.ack(message);
    } catch (error) {
      console.error('Falha no processamento da notificação', error);
      channel.nack(message, false, true);
    }
  }
}
