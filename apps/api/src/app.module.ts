import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '@app/database';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/admin/users/users.module';
import { ProfileModule } from './modules/admin/profile/profile.module';
import { PermissionsModule } from './modules/admin/permissions/permissions.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    DatabaseModule,
    AuthModule,
    UsersModule,
    ProfileModule,
    PermissionsModule,
  ],
})
export class AppModule {}
