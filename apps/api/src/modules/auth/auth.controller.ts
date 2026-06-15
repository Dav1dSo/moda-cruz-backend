import { Body, Controller, Post, Req } from '@nestjs/common';
import {
  AuthLoginRequestDTO,
  ConfirmResetPasswordRequestDTO,
  ResetPasswordRequestDTO,
} from './dtos/request/auth-service-dto';
import { AuthLoginService } from './login.service';
import {
  AuthLoginResponseDTO,
  RefreshTokenResponseDTO,
} from './dtos/response/auth-response-dto';
import { AuthRefreshTokenService } from './refresh-token.service';
import type { Request } from 'express';
import { ResetPasswordService } from './reset-password.service';
import { ConfirmResetPassword } from './confirm-reset-password.service';
import { ResponseDefaultDTO } from '../../shared/shared.dtos';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authLoginServive: AuthLoginService,
    private readonly authRefreshTokenService: AuthRefreshTokenService,
    private readonly authResetPasswordService: ResetPasswordService,
    private readonly authConfirmResetPassword: ConfirmResetPassword,
  ) {}

  @Post('/login')
  async login(@Body() req: AuthLoginRequestDTO): Promise<AuthLoginResponseDTO> {
    return await this.authLoginServive.execute(req);
  }

  @Post('/refresh')
  async refresh(@Req() req: Request): Promise<RefreshTokenResponseDTO> {
    return await this.authRefreshTokenService.execute({
      refreshToken: req.cookies.refreshToken,
    });
  }

  @Post('/reset-password')
  async resetPassword(
    @Body() req: ResetPasswordRequestDTO,
  ): Promise<ResponseDefaultDTO> {
    return await this.authResetPasswordService.execute(req);
  }

  @Post('/confirm-reset-password')
  async confirmResetPassword(
    @Body() req: ConfirmResetPasswordRequestDTO,
  ): Promise<ResponseDefaultDTO> {
    return await this.authConfirmResetPassword.execute(req);
  }
}
