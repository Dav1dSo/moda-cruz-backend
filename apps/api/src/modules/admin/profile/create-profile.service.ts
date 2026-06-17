import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '@app/database';
import { ResponseDefaultDTO } from '../../../shared/shared.dtos';
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
          is_active: req.is_active,
        },
      });

      await this.prismaService.profilePermission.createMany({
        data: req.permission_ids.map((permission_id) => ({
          profileId: profile.id,
          permission_id,
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
