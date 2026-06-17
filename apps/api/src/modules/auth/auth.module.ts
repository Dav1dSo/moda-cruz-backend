import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthLoginService } from './application/use-cases/login.use-case';
import { AuthController } from './auth.controller';
import { AuthRefreshTokenService } from './application/use-cases/refresh-token.use-case';
import { ResetPasswordService } from './application/use-cases/reset-password.use-case';
import { ConfirmResetPasswordUseCase } from './application/use-cases/confirm-reset-password.use-case';
import { AuthLoginRequired } from './guards/auth.guard';
import { EmailService } from '@app/notification';
import { UsersRepository } from './domain/repository';

@Module({
  imports: [
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
    UsersRepository
  ],
  exports: [JwtModule, AuthLoginRequired],
})
export class AuthModule {}
