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
import {
  CreatePermissionRequestDTO,
  UpdatePermissionRequestDTO,
} from './dtos/request/permission-request';
import { GetPermissionResponseDTO } from './dtos/response/permission-response';
import { ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { UpdatePermissionUseCase } from './application/use-cases/update-permission.use-case';
import { DeletePermissionUseCase } from './application/use-cases/delete-permission.use-case';
import { GetAllPermissionsUseCase } from './application/use-cases/get-all-permissions.use-case';
import { Permissions } from '../../auth/decorators/permissions.decorator';
import { AuthLoginRequiredGuard } from '../../auth/guards/auth-login-required.guard';
import { ResponseDefaultDTO } from '@shared/dtos';

@Controller('permissions')
export class PermissionsController {
  constructor(
    private readonly createPermissionUseCase: CreatePermissionUseCase,
    private readonly updatePermissionUseCase: UpdatePermissionUseCase,
    private readonly deletePermissionUseCase: DeletePermissionUseCase,
    private readonly getAllPermissionsUseCase: GetAllPermissionsUseCase,
  ) {}

  @ApiBearerAuth()
  @UseGuards(AuthLoginRequiredGuard)
  @Permissions('permission.create')
  @Post()
  async create(
    @Body() req: CreatePermissionRequestDTO,
  ): Promise<ResponseDefaultDTO> {
    return await this.createPermissionUseCase.execute(req);
  }

  @ApiBearerAuth()
  @UseGuards(AuthLoginRequiredGuard)
  @Permissions('permission.update')
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID da permissão',
    example: 1,
  })
  @Put(':id')
  async updatePermission(
    @Param('id', ParseIntPipe) id: number,
    @Body() req: UpdatePermissionRequestDTO,
  ): Promise<ResponseDefaultDTO> {
    return await this.updatePermissionUseCase.execute(id, req);
  }

  @ApiBearerAuth()
  @UseGuards(AuthLoginRequiredGuard)
  @Permissions('permission.delete')
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID da permissão',
    example: 1,
  })
  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ResponseDefaultDTO> {
    return await this.deletePermissionUseCase.execute(id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthLoginRequiredGuard)
  @Permissions('permission.read')
  @Get()
  async findAll(): Promise<GetPermissionResponseDTO[]> {
    return await this.getAllPermissionsUseCase.execute();
  }
}
