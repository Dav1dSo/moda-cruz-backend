import {
  Controller,
  Post,
  Body,
  Query,
  Get,
  UseGuards,
  Delete,
  ParseIntPipe,
  Param,
  Put,
} from '@nestjs/common';
import {
  CreateProfileRequestDTO,
  GetAllProfilesRequestDTO,
  UpdateProfileRequestDTO,
} from './dtos/request/profile-request';
import { CreateProfileUseCase } from './application/use-cases/create-profile.use-case';
import { GetAllProfilesResponseDTO } from './dtos/response/profile-response';
import { GetAllProfilesUseCase } from './application/use-cases/get-all-profiles.use-case';
import { AuthLoginRequired } from '../../auth/guards/auth.guard';
import { ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { Permissions } from '../../auth/decorators/permissions-decorator';
import { DeleteProfileUseCase } from './application/use-cases/delete-profile.use-case';
import { ResponseDefaultDTO } from '../../../shared/shared.dtos';
import { UpdateProfileUseCase } from './application/use-cases/update-profile.use-case';

@Controller('profile')
export class ProfileController {
  constructor(
    private readonly createProfileUseCase: CreateProfileUseCase,
    private readonly getAllProfilesUseCase: GetAllProfilesUseCase,
    private readonly deleteProfileUseCase: DeleteProfileUseCase,
    private readonly updateProfileUseCase: UpdateProfileUseCase,
  ) {}

  @ApiBearerAuth()
  @UseGuards(AuthLoginRequired)
  @Permissions('profile.create')
  @Post()
  async create(
    @Body() req: CreateProfileRequestDTO,
  ): Promise<ResponseDefaultDTO> {
    return await this.createProfileUseCase.execute(req);
  }

  @ApiBearerAuth()
  @UseGuards(AuthLoginRequired)
  @Permissions('profile.read')
  @Get()
  async findAll(
    @Query() filters: GetAllProfilesRequestDTO,
  ): Promise<GetAllProfilesResponseDTO[]> {
    return await this.getAllProfilesUseCase.execute(filters);
  }

  @ApiBearerAuth()
  @UseGuards(AuthLoginRequired)
  @Permissions('profile.delete')
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID do perfil',
    example: 1,
  })
  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ResponseDefaultDTO> {
    return await this.deleteProfileUseCase.execute(id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthLoginRequired)
  @Permissions('profile.update')
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID do perfil',
    example: 1,
  })
  @Put(':id')
  async updateProfile(
    @Param('id', ParseIntPipe) id: number,
    @Body() req: UpdateProfileRequestDTO,
  ): Promise<ResponseDefaultDTO> {
    return await this.updateProfileUseCase.execute(id, req);
  }
}
