import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AuthLoginService } from './application/use-cases/login.use-case';
import { AuthController } from './auth.controller';
import { AuthRefreshTokenService } from './application/use-cases/refresh-token.use-case';
import { ResetPasswordService } from './application/use-cases/reset-password.use-case';
import { ConfirmResetPasswordUseCase } from './application/use-cases/confirm-reset-password.use-case';
import { AuthLoginRequired } from './guards/auth.guard';
import { AuthRepository } from './domain/repository';
import {
  NOTIFICATIONS_CLIENT,
  NOTIFICATIONS_QUEUE,
} from '@contracts/auth/reset-password-requested.event';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: NOTIFICATIONS_CLIENT,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [
              configService.get<string>('RABBITMQ_URL') ??
                'amqp://admin:admin123@localhost:5672',
            ],
            queue: NOTIFICATIONS_QUEUE,
            queueOptions: {
              durable: true,
            },
            persistent: true,
          },
        }),
      },
    ]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secret',
      signOptions: {
        expiresIn: '15m',
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthLoginService,
    AuthRefreshTokenService,
    ResetPasswordService,
    ConfirmResetPasswordUseCase,
    AuthLoginRequired,
    AuthRepository,
  ],
  exports: [JwtModule, AuthLoginRequired],
})
export class AuthModule {}
