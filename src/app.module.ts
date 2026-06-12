import { SharedModule } from './infraestructure/services/services.module';
import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ProfileModule } from './profile/profile.module';

@Module({
  imports: [AuthModule, SharedModule, UsersModule, ProfileModule],
})
export class AppModule {}
