import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PermissionsModule } from './permissions/permissions.module';
import { ProfileModule } from './profile/profile.module';
import { UsersModule } from './users/users.module';
import { DatabaseModule } from '@app/database';

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
