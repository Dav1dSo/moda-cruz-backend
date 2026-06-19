import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '@app/database';
import { ResponseDefaultDTO } from 'apps/api/src/shared/shared.dtos';
import { CreateUserRequestDTO } from '../../dtos/request/user-request';
import { UserRepository } from '../../domain/repositories/users.repository';

@Injectable()
export class CreateUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(req: CreateUserRequestDTO): Promise<ResponseDefaultDTO> {
    try {
      const user = await this.userRepository.getuserByEmail(req.email);

      if (!user) {
        throw new ConflictException('Email não permitido.');
      }

      await this.userRepository.createUser(req);

      TODO: 'REALIZAR ENVIO DO EMAIL PRODUCER';
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

      return { message: 'Usuaŕio criado com sucesso' };
    } catch (error) {
      throw error;
    }
  }
}
