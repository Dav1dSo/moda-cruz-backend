import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/infraestructure/services/database/prisma.service';
import { UpdateProfileRequestDTO } from './dto/request/profile-request-dto';

@Injectable()
export class UpdateProfileService {
  constructor(private readonly prismaService: PrismaService) {}

  async execute(id: number, req: UpdateProfileRequestDTO) {
    const profile = await this.prismaService.profile.findUnique({
      where: { id },
    });

    if (!profile) {
      throw new NotFoundException('Perfil não encontrado');
    }

    if (req.name) {
      const nameExists = await this.prismaService.profile.findFirst({
        where: {
          name: req.name,
          NOT: {
            id,
          },
        },
      });

      if (nameExists) {
        throw new ConflictException('Já existe um perfil com este nome');
      }
    }

    await this.prismaService.profile.update({
      where: { id },
      data: {
        ...(req.name && { name: req.name }),
        ...(req.active !== undefined && { active: req.active }),
      },
    });

    return {message: "Perfil atualizado com sucesso"};
  }
}
