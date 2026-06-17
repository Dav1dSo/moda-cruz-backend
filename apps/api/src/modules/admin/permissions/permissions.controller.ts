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
import { CreatePermissionService } from './create-permission.service';
import { CreatePermissionRequestDTO } from './dto/request/permisions-request-dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { UpdatePermissionService } from './update-permission.service';
import { DeletePermissionService } from './delete-permission.service';
import { GetAllPermissionsService } from './getall-permissions.service';
import { Permissions } from '../../auth/decorators/permissions-decorator';
import { AuthLoginRequired } from '../../auth/guards/auth.guard';
import { ResponseDefaultDTO } from 'apps/api/src/shared/shared.dtos';

@Controller('permissions')
export class PermissionsController {
  constructor(
    private readonly createPermissionService: CreatePermissionService,
    private readonly updatePermissionService: UpdatePermissionService,
    private readonly deletePermissionService: DeletePermissionService,
    private readonly getAllPermissionsService: GetAllPermissionsService,
  ) {}

  @ApiBearerAuth()
  @UseGuards(AuthLoginRequired)
  @Permissions('permission.create')
  @Post()
  async execute(
    @Body() req: CreatePermissionRequestDTO,
  ): Promise<ResponseDefaultDTO> {
    return await this.createPermissionService.execute(req);
  }

  @ApiBearerAuth()
  @UseGuards(AuthLoginRequired)
  @Permissions('permission.update')
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() req: CreatePermissionRequestDTO,
  ) {
    return await this.updatePermissionService.execute(id, req);
  }

  @ApiBearerAuth()
  @UseGuards(AuthLoginRequired)
  @Permissions('permission.delete')
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return await this.deletePermissionService.execute(id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthLoginRequired)
  @Permissions('permission.read')
  @Get()
  async getAll() {
    return await this.getAllPermissionsService.execute();
  }
}
