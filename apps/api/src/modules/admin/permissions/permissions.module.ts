import { Module } from '@nestjs/common';
import { PermissionsController } from './permissions.controller';
import { CreatePermissionUseCase } from './application/use-cases/create-permission.use-case';
import { UpdatePermissionUseCase } from './application/use-cases/update-permission.use-case';
import { DeletePermissionUseCase } from './application/use-cases/delete-permission.use-case';
import { GetAllPermissionsUseCase } from './application/use-cases/getall-permissions.use-case';
import { AuthModule } from '../../auth/auth.module';
import { PermissionRepository } from './domain/repositories/permission.repository';

@Module({
  imports: [AuthModule],
  controllers: [PermissionsController],
  providers: [
    CreatePermissionUseCase,
    UpdatePermissionUseCase,
    DeletePermissionUseCase,
    GetAllPermissionsUseCase,
    PermissionRepository,
  ],
})
export class PermissionsModule {}
