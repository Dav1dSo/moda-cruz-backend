import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthLoginService } from './login.service';
import { AuthController } from './auth.controller';
import { AuthRefreshTokenService } from './refresh-token.service';
import { ResetPasswordService } from './reset-password.service';
import { ConfirmResetPassword } from './confirm-reset-password.service';
import { AuthLoginRequired } from './guards/auth.guard';

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
    ConfirmResetPassword,
    AuthLoginRequired,
  ],
  exports: [JwtModule, AuthLoginRequired],
})
export class AuthModule {}
