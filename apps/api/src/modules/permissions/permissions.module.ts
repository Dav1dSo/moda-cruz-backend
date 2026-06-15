import { Module } from '@nestjs/common';
import { PermissionsController } from './permissions.controller';
import { CreatePermissionService } from './create-permission.service';
import { AuthModule } from '../auth/auth.module';
import { UpdatePermissionService } from './update-permission.service';
import { DeletePermissionService } from './delete-permission.service';
import { GetAllPermissionsService } from './getall-permissions.service';

@Module({
  imports: [AuthModule],
  controllers: [PermissionsController],
  providers: [
    CreatePermissionService,
    UpdatePermissionService,
    DeletePermissionService,
    GetAllPermissionsService,
  ],
})
export class PermissionsModule {}
