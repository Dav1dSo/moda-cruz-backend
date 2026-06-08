import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersServiceCreate } from './create-users.service';
import { UserServiceGetAll } from './getall-users.service';
import { FindUserService } from './find-user.service';
import { UserServiceDelete } from './delete-user.service';

@Module({
  controllers: [UsersController],
  providers: [
    UserServiceGetAll,
    UsersServiceCreate,
    FindUserService,
    UserServiceDelete,
  ],
})
export class UsersModule {}
