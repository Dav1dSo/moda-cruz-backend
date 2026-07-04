import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Put,
  ParseIntPipe,
} from '@nestjs/common';
import { CreatePermissionUseCase } from './application/use-cases/create-permission.use-case';
import { CreatePermissionRequestDTO } from './dto/request/permisions-request-dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { UpdatePermissionUseCase } from './application/use-cases/update-permission.use-case';
import { DeletePermissionUseCase } from './application/use-cases/delete-permission.use-case';
import { GetAllPermissionsUseCase } from './application/use-cases/getall-permissions.use-case';
import { Permissions } from '../../auth/decorators/permissions-decorator';
import { AuthLoginRequired } from '../../auth/guards/auth.guard';
import { ResponseDefaultDTO } from 'apps/api/src/shared/shared.dtos';

@Controller('permissions')
export class PermissionsController {
  constructor(
    private readonly createPermissionUseCase: CreatePermissionUseCase,
    private readonly updatePermissionUseCase: UpdatePermissionUseCase,
    private readonly deletePermissionUseCase: DeletePermissionUseCase,
    private readonly getAllPermissionsUseCase: GetAllPermissionsUseCase,
  ) {}

  @ApiBearerAuth()
  @UseGuards(AuthLoginRequired)
  @Permissions('permission.create')
  @Post()
  async execute(
    @Body() req: CreatePermissionRequestDTO,
  ): Promise<ResponseDefaultDTO> {
    return await this.createPermissionUseCase.execute(req);
  }

  @ApiBearerAuth()
  @UseGuards(AuthLoginRequired)
  @Permissions('permission.update')
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() req: CreatePermissionRequestDTO,
  ) {
    return await this.updatePermissionUseCase.execute(id, req);
  }

  @ApiBearerAuth()
  @UseGuards(AuthLoginRequired)
  @Permissions('permission.delete')
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return await this.deletePermissionUseCase.execute(id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthLoginRequired)
  @Permissions('permission.read')
  @Get()
  async getAll() {
    return await this.getAllPermissionsUseCase.execute();
  }
}
