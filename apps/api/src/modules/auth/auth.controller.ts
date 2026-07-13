import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import {
  AuthLoginRequestDTO,
  ConfirmResetPasswordRequestDTO,
  RegisterRequestDTO,
  ResetPasswordRequestDTO,
} from './dtos/request/auth-request';
import { LoginUseCase } from './application/use-cases/login.use-case';
import {
  LoginResponseDTO,
  MeResponseDTO,
  RefreshTokenResponseDTO,
} from './dtos/response/auth-response';
import { RefreshTokenUseCase } from './application/use-cases/refresh-token.use-case';
import type { Request, Response } from 'express';
import { ResetPasswordUseCase } from './application/use-cases/reset-password.use-case';
import { ConfirmResetPasswordUseCase } from './application/use-cases/confirm-reset-password.use-case';
import { RegisterCustomerUseCase } from './application/use-cases/register-customer.use-case';
import { GetMeUseCase } from './application/use-cases/get-me.use-case';
import { ResponseDefaultDTO } from '@shared/dtos';
import { ApiBearerAuth } from '@nestjs/swagger';
import { UseGuards } from '@nestjs/common';
import { AuthLoginRequiredGuard } from './guards/auth-login-required.guard';
import {
  CurrentUser,
  type JwtUserPayload,
} from './decorators/current-user.decorator';

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
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly resetPasswordUseCase: ResetPasswordUseCase,
    private readonly confirmResetPasswordUseCase: ConfirmResetPasswordUseCase,
    private readonly registerCustomerUseCase: RegisterCustomerUseCase,
    private readonly getMeUseCase: GetMeUseCase,
  ) {}

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('/register')
  async register(@Body() req: RegisterRequestDTO): Promise<ResponseDefaultDTO> {
    return await this.registerCustomerUseCase.execute(req);
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('/login')
  async login(
    @Body() req: AuthLoginRequestDTO,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginResponseDTO> {
    const result = await this.loginUseCase.execute(req);

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

  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @Post('/refresh')
  async refresh(@Req() req: Request): Promise<RefreshTokenResponseDTO> {
    return await this.refreshTokenUseCase.execute(
      req.cookies.refreshToken as string | undefined,
    );
  }

  @Post('/logout')
  logout(@Res({ passthrough: true }) res: Response): ResponseDefaultDTO {
    res.clearCookie(REFRESH_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE_OPTIONS);
    return { message: 'Sessão finalizada com sucesso' };
  }

  @ApiBearerAuth()
  @UseGuards(AuthLoginRequiredGuard)
  @Get('/me')
  async me(@CurrentUser() currentUser: JwtUserPayload): Promise<MeResponseDTO> {
    return await this.getMeUseCase.execute(currentUser.email);
  }

  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Post('/reset-password')
  async resetPassword(
    @Body() req: ResetPasswordRequestDTO,
  ): Promise<ResponseDefaultDTO> {
    return await this.resetPasswordUseCase.execute(req);
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('/confirm-reset-password')
  async confirmResetPassword(
    @Body() req: ConfirmResetPasswordRequestDTO,
  ): Promise<ResponseDefaultDTO> {
    return await this.confirmResetPasswordUseCase.execute(req);
  }
}
