import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infraestructure/services/database/prisma.service';
import { ResponseDefaultDTO } from 'src/shared/shared.dtos';
import { CreateProfileRequestDTO } from './dto/request/profile-request-dto';

@Injectable()
export class CreateProfileService {
  constructor(private readonly prismaService: PrismaService) {}

  async execute(req: CreateProfileRequestDTO): Promise<ResponseDefaultDTO> {
    try {
      const profileExists = await this.prismaService.profile.findFirst({
        where: {
          name: req.name,
        },
      });

      if (profileExists) {
        throw new ConflictException('Já existe perfil com este nome.');
      }

      const profile = await this.prismaService.profile.create({
        data: {
          name: req.name,
          active: req.active,
        },
      });

      await this.prismaService.profilePermission.createMany({
        data: req.permissionIds.map((permissionId) => ({
          profileId: profile.id,
          permissionId,
        })),
      });

      return {
        message: 'Perfil criado com sucesso',
      };
    } catch (error) {
      throw error;
    }
  }
}
