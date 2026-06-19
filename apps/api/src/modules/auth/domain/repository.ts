import { Injectable } from '@nestjs/common';
import { PrismaService } from '@app/database';

@Injectable()
export class AuthRepository {
  constructor(private readonly db: PrismaService) {}

  async getUserByEmail(email: string) {
    return await this.db.user.findFirst({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        is_platform_admin: true,
        deleted_at: true,
        is_active: true,
        password_hash: true,
        user_organizations: {
          select: {
            organization_id: true,
            congregation_id: true,
            is_active: true,
            organization: {
              select: {
                legal_name: true,
              },
            },
            congregation: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });
  }
}
