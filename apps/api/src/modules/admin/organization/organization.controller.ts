import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { AuthLoginRequired } from '../../auth/guards/auth.guard';
import { Permissions } from '../../auth/decorators/permissions-decorator';
import { ResponseDefaultDTO } from 'apps/api/src/shared/shared.dtos';
import { CreateOrganizationRequestDTO } from './dto/request/organization-request.dto';
import {
  FindOrganizationResponseDTO,
  GetAllOrganizationsFiltersDTO,
  GetAllOrganizationsResponseDTO,
  OrganizationResponseDTO,
} from './dto/response/organization-response.dto';
import { CreateOrganizationUseCase } from './application/use-cases/create-organization.use-case';
import { GetAllOrganizationsUseCase } from './application/use-cases/get-all-organizations.use-case';
import { GetOrganizationByIdUseCase } from './application/use-cases/get-organization-by-id.use-case';
import { UpdateOrganizationUseCase } from './application/use-cases/update-organization.use-case';

@Controller('organizations')
export class OrganizationsController {
  constructor(
    private readonly getAllOrganizationsUseCase: GetAllOrganizationsUseCase,
    private readonly getOrganizationByIdUseCase: GetOrganizationByIdUseCase,
    private readonly createOrganizationUseCase: CreateOrganizationUseCase,
    private readonly updateOrganizationUseCase: UpdateOrganizationUseCase,
  ) {}

  @ApiBearerAuth()
  @UseGuards(AuthLoginRequired)
  @Permissions('organization.read')
  @Get('')
  async findAll(
    @Query() filters: GetAllOrganizationsFiltersDTO,
  ): Promise<GetAllOrganizationsResponseDTO> {
    return await this.getAllOrganizationsUseCase.execute(filters);
  }

  @ApiBearerAuth()
  @UseGuards(AuthLoginRequired)
  @Permissions('organization.read')
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID da organização',
    example: 1,
  })
  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<FindOrganizationResponseDTO> {
    console.log('requests')
    return this.getOrganizationByIdUseCase.execute(id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthLoginRequired)
  @Permissions('organization.created')
  @Post()
  async createOrganization(
    @Body() req: CreateOrganizationRequestDTO,
  ): Promise<ResponseDefaultDTO> {
    return this.createOrganizationUseCase.execute(req);
  }

  @ApiBearerAuth()
  @UseGuards(AuthLoginRequired)
  @Permissions('organization.update')
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID da organização',
    example: 1,
  })
  @Put(':id')
  async updateOrganization(
    @Body() req: CreateOrganizationRequestDTO,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ResponseDefaultDTO> {
    return this.updateOrganizationUseCase.execute(req, id);
  }
}
