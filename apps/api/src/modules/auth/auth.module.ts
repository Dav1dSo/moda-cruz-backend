import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { AuthController } from './auth.controller';
import { RefreshTokenUseCase } from './application/use-cases/refresh-token.use-case';
import { ResetPasswordUseCase } from './application/use-cases/reset-password.use-case';
import { ConfirmResetPasswordUseCase } from './application/use-cases/confirm-reset-password.use-case';
import { RegisterCustomerUseCase } from './application/use-cases/register-customer.use-case';
import { GetMeUseCase } from './application/use-cases/get-me.use-case';
import { AuthLoginRequired } from './guards/auth.guard';
import { AuthRepository } from './infrastructure/repositories/auth.repository';
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
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET');

        if (!secret) {
          throw new Error('JWT_SECRET não configurado');
        }

        const resetPasswordSecret = configService.get<string>(
          'JWT_RESET_PASSWORD_SECRET',
        );

        if (!resetPasswordSecret) {
          throw new Error('JWT_RESET_PASSWORD_SECRET não configurado');
        }

        return {
          secret,
          signOptions: {
            expiresIn: '15m',
          },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    LoginUseCase,
    RefreshTokenUseCase,
    ResetPasswordUseCase,
    ConfirmResetPasswordUseCase,
    RegisterCustomerUseCase,
    GetMeUseCase,
    AuthLoginRequired,
    AuthRepository,
  ],
  exports: [JwtModule, AuthLoginRequired],
})
export class AuthModule {}
