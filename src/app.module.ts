import { SharedModule } from './infraestructure/services/services.module';
import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [AuthModule, SharedModule, UsersModule],
})
export class AppModule {}
