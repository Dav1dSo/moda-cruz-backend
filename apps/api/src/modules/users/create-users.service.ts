import { ConflictException, Injectable } from '@nestjs/common';
import { CreateUserRequestDTO } from './dtos/request/user-request';
import { PrismaService } from '@app/database';
import * as bcrypt from 'bcrypt';
import { ResponseDefaultDTO } from '../../shared/shared.dtos';

@Injectable()
export class UsersServiceCreate {
  constructor(
    private readonly prismaService: PrismaService,
  ) {}

  async execute(req: CreateUserRequestDTO): Promise<ResponseDefaultDTO> {
    try {
      if (
        await this.prismaService.user.findUnique({
          where: { email: req.email },
        })
      ) {
        throw new ConflictException('Email already exists');
      }

      await this.prismaService.$transaction(async (tx) => {
        await tx.user.create({
          data: {
            name: req.name,
            email: req.email,
            telefone: req.telefone,
            password: await bcrypt.hash(req.password, 10),

            address: {
              create: {
                street: req.street,
                city: req.city,
                state: req.state,
                zipCode: req.zipCode,
                country: req.country,
                number: req.number,
              },
            },
          },
        });
      });

      TODO: 'REALIZAR ENVIO DO EMAIL PRODUCER'
      // await this.emailService.sendEmail(
      //   req.email,
      //   'Bem-vindo ao nosso serviço',
      //   welcomeUserTemplate(
      //     req.name,
      //     '/verify-email',
      //     new Date().getFullYear(),
      //   ),
      //   process.env.EMAIL_FROM || '',
      // );

      return {message: "Usuaŕio criado com sucesso"}

    } catch (error) {
      throw error;
    }
  }
}
