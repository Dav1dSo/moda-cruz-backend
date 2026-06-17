import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ResponseDefaultDTO } from 'apps/api/src/shared/shared.dtos';
import { CreateOrganizationRequestDTO } from './dto/request/organization-request.dto';
import { AuthLoginRequired } from '../../auth/guards/auth.guard';
import { Permissions } from '../../auth/decorators/permissions-decorator';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CreateOrganizationUseCase } from './application/use-cases/create-organization.use-case';
import { Permission } from '../permissions/entities/permission.entity';
import { UpdateOrganizationUseCase } from './application/use-cases/update-organization.use-case';

@Controller('organizations')
export class OrganizationsController {
  constructor(
    private readonly createOrganizationUseCase: CreateOrganizationUseCase,
    private readonly updateOrganizationUseCase: UpdateOrganizationUseCase,
  ) {}

  @ApiBearerAuth()
  @UseGuards(AuthLoginRequired)
  @Permissions('organization.created')
  @Post()
  async createOrganization(
    @Body() req: CreateOrganizationRequestDTO,
  ): Promise<ResponseDefaultDTO> {
    return await this.createOrganizationUseCase.execute(req);
  }

  @ApiBearerAuth()
  @UseGuards(AuthLoginRequired)
  @Permissions('organization.update')
  @Put(':id')
  async updateOrganization(
    @Body() req: CreateOrganizationRequestDTO,
    @Param('id', ParseIntPipe) id: Number,
  ): Promise<ResponseDefaultDTO> {
    return await this.updateOrganizationUseCase.execute(req, id);
  }
}
