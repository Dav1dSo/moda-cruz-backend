import { SharedModule } from './infraestructure/services/services.module';
import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';

@Module({
  imports: [SharedModule, UsersModule],
})
export class AppModule {}
