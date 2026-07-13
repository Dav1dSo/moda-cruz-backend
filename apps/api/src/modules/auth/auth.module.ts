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
import { AuthLoginRequiredGuard } from './guards/auth-login-required.guard';
import { AuthRepository } from './infrastructure/repositories/auth.repository';
import {
  NOTIFICATIONS_CLIENT,
  NOTIFICATIONS_QUEUE_ARGUMENTS,
  NOTIFICATIONS_QUEUE,
} from '@contracts/notifications';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: NOTIFICATIONS_CLIENT,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => {
          const rabbitmqUrl = configService.get<string>('RABBITMQ_URL');

          if (!rabbitmqUrl) {
            throw new Error('RABBITMQ_URL não configurado');
          }

          return {
            transport: Transport.RMQ,
            options: {
              urls: [rabbitmqUrl],
              queue: NOTIFICATIONS_QUEUE,
              queueOptions: {
                durable: true,
                arguments: NOTIFICATIONS_QUEUE_ARGUMENTS,
              },
              persistent: true,
            },
          };
        },
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

        const refreshSecret = configService.get<string>('JWT_REFRESH_SECRET');

        if (!refreshSecret) {
          throw new Error('JWT_REFRESH_SECRET não configurado');
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
    AuthLoginRequiredGuard,
    AuthRepository,
  ],
  exports: [JwtModule, AuthLoginRequiredGuard],
})
export class AuthModule {}
