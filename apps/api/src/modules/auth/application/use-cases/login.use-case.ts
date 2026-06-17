import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthLoginRequestDTO } from '../../dtos/request/auth-service-dto';
import { RequiredLoginResponseDTO } from '../../dtos/response/auth-response-dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UsersRepository } from '../../domain/repository';

@Injectable()
export class AuthLoginService {
  constructor(
    private readonly userRepository: UsersRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(req: AuthLoginRequestDTO): Promise<RequiredLoginResponseDTO> {
    try {
      const user = await this.userRepository.getUserByEmail(req.email);

      console.log(user);

      if (!user || user.deleted_at != null) {
        throw new UnauthorizedException('Credenciais inválidas!');
      }

      if (!user.is_active) {
        throw new BadRequestException('Usuário inativo');
      }

      const passwordMatch = await bcrypt.compare(
        req.password,
        user.password_hash,
      );

      if (!passwordMatch) {
        throw new UnauthorizedException('Credenciais inválidas!');
      }
      const selectionToken = await this.jwtService.signAsync(
        {
          sub: user.id,
          email: user.email,
          type: 'organization-selection',
        },
        {
          secret: process.env.JWT_SELECTION_SECRET,
          expiresIn: '5m',
        },
      );
 
      return {
        selection_token_organization: selectionToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          is_plataform_admin: user.is_platform_admin
        },
        avaliable_organizations: user.user_organizations.map((userOrganization) => (
          {
            is_active: userOrganization.is_active,
            organization_id: userOrganization.organization_id,
            congregation_vinculo_id: userOrganization.congregation_id,
            congregation_name: userOrganization.congregation.name,
            organization_name: userOrganization.organization.legal_name,
          }
        ))
      }

    } catch (error) {
      throw error;
    }
  }
}
