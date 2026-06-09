import { SharedModule } from './infraestructure/services/services.module';
import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { AuthhModule } from './auth/auth.module';

@Module({
  imports: [AuthhModule, SharedModule, UsersModule],
})
export class AppModule {}
