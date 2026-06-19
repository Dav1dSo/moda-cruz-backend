import { Module } from '@nestjs/common';
import { DatabaseModule } from '@app/database';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/admin/users/users.module';
import { ProfileModule } from './modules/admin/profile/profile.module';
import { PermissionsModule } from './modules/admin/permissions/permissions.module';
import { OrganizationModule } from './modules/admin/organization/organization.module';
import { SecretariaModule } from './modules/secretaria/secretaria.module';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    UsersModule,
    ProfileModule,
    PermissionsModule,
    OrganizationModule,
    SecretariaModule,
  ],
})
export class AppModule {}
