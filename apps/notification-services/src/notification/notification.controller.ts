import { Controller, Logger } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import type { Channel, Message } from 'amqplib';
import { RESET_PASSWORD_REQUESTED_EVENT } from '@contracts/auth/reset-password-requested.event';
import type { ResetPasswordRequestedEvent } from '@contracts/auth/reset-password-requested.event';
import { USER_CREATED_EVENT } from '@contracts/users/user-created.event';
import type { UserCreatedEvent } from '@contracts/users/user-created.event';
import { SendResetPasswordEmailUseCase } from './application/use-cases/send-reset-password-email.use-case';
import { SendWelcomeEmailUseCase } from './application/use-cases/send-welcome-email.use-case';

@Controller()
export class NotificationController {
  private readonly logger = new Logger(NotificationController.name);

  constructor(
    private readonly sendResetPasswordEmailUseCase: SendResetPasswordEmailUseCase,
    private readonly sendWelcomeEmailUseCase: SendWelcomeEmailUseCase,
  ) {}

  @EventPattern(RESET_PASSWORD_REQUESTED_EVENT)
  async sendResetPasswordEmail(
    @Payload() event: ResetPasswordRequestedEvent,
    @Ctx() context: RmqContext,
  ): Promise<void> {
    const channel = context.getChannelRef() as Channel;
    const originalMsg = context.getMessage() as Message;

    try {
      await this.sendResetPasswordEmailUseCase.execute(event);
      channel.ack(originalMsg);
    } catch (error) {
      this.logger.error(
        `Falha ao processar evento ${RESET_PASSWORD_REQUESTED_EVENT} para o destinatário ${event.to}`,
        error instanceof Error ? error.stack : String(error),
      );
      channel.nack(originalMsg, false, false);
    }
  }

  @EventPattern(USER_CREATED_EVENT)
  async sendWelcomeEmail(
    @Payload() event: UserCreatedEvent,
    @Ctx() context: RmqContext,
  ): Promise<void> {
    const channel = context.getChannelRef() as Channel;
    const originalMsg = context.getMessage() as Message;

    try {
      await this.sendWelcomeEmailUseCase.execute(event);
      channel.ack(originalMsg);
    } catch (error) {
      this.logger.error(
        `Falha ao processar evento ${USER_CREATED_EVENT} para o destinatário ${event.email}`,
        error instanceof Error ? error.stack : String(error),
      );
      channel.nack(originalMsg, false, false);
    }
  }
}
