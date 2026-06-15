import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersServiceCreate } from './create-users.service';
import { UserServiceGetAll } from './getall-users.service';
import { FindUserService } from './find-user.service';
import { UserServiceDelete } from './delete-user.service';
import { UserServiceUpdate } from './update-user.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [UsersController],
  providers: [
    UserServiceGetAll,
    UsersServiceCreate,
    FindUserService,
    UserServiceDelete,
    UserServiceUpdate
  ],
})
export class UsersModule {}
