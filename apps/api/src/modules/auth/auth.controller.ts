import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import {
  AuthLoginRequestDTO,
  ConfirmResetPasswordRequestDTO,
  RegisterRequestDTO,
  ResetPasswordRequestDTO,
} from './dtos/request/auth-service-dto';
import { AuthLoginService } from './application/use-cases/login.use-case';
import {
  LoginResponseDTO,
  MeResponseDTO,
  RefreshTokenResponseDTO,
} from './dtos/response/auth-response-dto';
import { AuthRefreshTokenService } from './application/use-cases/refresh-token.use-case';
import type { Request, Response } from 'express';
import { ResetPasswordService } from './application/use-cases/reset-password.use-case';
import { ConfirmResetPasswordUseCase } from './application/use-cases/confirm-reset-password.use-case';
import { RegisterCustomerUseCase } from './application/use-cases/register-customer.use-case';
import { GetMeUseCase } from './application/use-cases/get-me.use-case';
import { ResponseDefaultDTO } from '../../shared/shared.dtos';
import { ApiBearerAuth } from '@nestjs/swagger';
import { UseGuards } from '@nestjs/common';
import { AuthLoginRequired } from './guards/auth.guard';
import { CurrentUser } from './decorators/current-user-decorator';

const REFRESH_TOKEN_COOKIE = 'refreshToken';
const REFRESH_TOKEN_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/auth',
};

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authLoginServive: AuthLoginService,
    private readonly authRefreshTokenService: AuthRefreshTokenService,
    private readonly authResetPasswordService: ResetPasswordService,
    private readonly authConfirmResetPassword: ConfirmResetPasswordUseCase,
    private readonly registerCustomerUseCase: RegisterCustomerUseCase,
    private readonly getMeUseCase: GetMeUseCase,
  ) {}

  @Post('/register')
  async register(@Body() req: RegisterRequestDTO): Promise<ResponseDefaultDTO> {
    return await this.registerCustomerUseCase.execute(req);
  }

  @Post('/login')
  async login(
    @Body() req: AuthLoginRequestDTO,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginResponseDTO> {
    const result = await this.authLoginServive.execute(req);

    res.cookie(REFRESH_TOKEN_COOKIE, result.refreshToken, {
      ...REFRESH_TOKEN_COOKIE_OPTIONS,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return {
      accessToken: result.accessToken,
      user: result.user,
      profiles: result.profiles,
    };
  }

  @Post('/refresh')
  async refresh(@Req() req: Request): Promise<RefreshTokenResponseDTO> {
    return await this.authRefreshTokenService.execute({
      refreshToken: req.cookies.refreshToken,
    });
  }

  @Post('/logout')
  logout(@Res({ passthrough: true }) res: Response): ResponseDefaultDTO {
    res.clearCookie(REFRESH_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE_OPTIONS);
    return { message: 'Sessão finalizada com sucesso' };
  }

  @ApiBearerAuth()
  @UseGuards(AuthLoginRequired)
  @Get('/me')
  async me(@CurrentUser() currentUser: { email: string }): Promise<MeResponseDTO> {
    return await this.getMeUseCase.execute(currentUser.email);
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
