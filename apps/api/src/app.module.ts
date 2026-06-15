import { Module } from '@nestjs/common';
import { DatabaseModule } from '@app/database';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ProfileModule } from './modules/profile/profile.module';
import { PermissionsModule } from './modules/permissions/permissions.module';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    UsersModule,
    ProfileModule,
    PermissionsModule,
  ],
})
export class AppModule {}
