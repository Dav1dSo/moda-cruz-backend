import { Body, Controller, Post, Req } from '@nestjs/common';
import { AuthLoginRequestDTO } from './dtos/request/auth-service-dto';
import { AuthLoginService } from './login-service';
import {
  AuthLoginResponseDTO,
  RefreshTokenResponseDTO,
} from './dtos/response/auth-response-dto';
import { AuthRefreshTokenService } from './refresh-token-service';
import type { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authLoginServive: AuthLoginService,
    private readonly authRefreshTokenService: AuthRefreshTokenService,
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
}
