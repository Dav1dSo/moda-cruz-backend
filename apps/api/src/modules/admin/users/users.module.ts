import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UserServiceGetAll } from './getall-users.service';
import { FindUserService } from './find-user.service';
import { UserServiceDelete } from './delete-user.service';
import { UserServiceUpdate } from './update-user.service';
import { AuthModule } from '../../auth/auth.module';
import { CreateUserUseCase } from './application/use-cases/create-users.use-case';
import { UserRepository } from './domain/repositories/users.repository';

@Module({
  imports: [AuthModule],
  controllers: [UsersController],
  providers: [
    UserServiceGetAll,
    CreateUserUseCase,
    FindUserService,
    UserServiceDelete,
    UserServiceUpdate,
    UserRepository,
  ],
})
export class UsersModule {}
