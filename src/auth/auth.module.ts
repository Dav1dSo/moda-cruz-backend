import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthLoginService } from './login-service';
import { AuthController } from './auth.controller';
import { AuthRefreshTokenService } from './refresh-token-service';

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
  providers: [AuthLoginService, AuthRefreshTokenService],
})
export class AuthhModule {}
