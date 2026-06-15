import { Body, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@app/database';
import { ResetPasswordRequestDTO } from './dtos/request/auth-service-dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class ResetPasswordService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async execute(req: ResetPasswordRequestDTO) {
    try {
      const user = await this.prismaService.user.findFirst({
        where: {
          email: req.email,
        },
      });

      if (!user) {
        throw new NotFoundException('Email inválido!');
      }
      

      const tokenResetPassword = this.jwtService.sign(
        {
          sub: user.id,
          type: 'reset-password',
        },
        {
          expiresIn: '1DAY',
        },
      );

        console.log(tokenResetPassword)

      const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${tokenResetPassword}`;

      TODO:
      // this.emailSerive.sendEmail(
      //   req.email,
      //   'Recuperação de senha',
      //   resetPasswordTemplate(user.name, resetLink),
      // );

      return await {
        message: 'Acesse seu email para recuperar senha',
      };
    } catch (error) {
      throw error;
    }
  }
}
