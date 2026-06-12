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
} from '@nestjs/common';
import {
  CreateProfileRequestDTO,
  GetAllProfilesRequestDTO,
  UpdateProfileRequestDTO,
} from './dto/request/profile-request-dto';
import { CreateProfileService } from './create-profile.service';
import { GetAllProfilesResponseDTO } from './dto/response/profile-respone-dto';
import { GetAllProfilesService } from './get-all-profiles.service';
import { AuthLoginRequired } from 'src/auth/guards/auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Permissions } from 'src/auth/decorators/permissions-decorator';
import { DeleteProfileService } from './delete-profile.service';
import { ResponseDefaultDTO } from 'src/shared/shared.dtos';
import { UpdateProfileService } from './update-profile.service';

@Controller('profile')
export class ProfileController {
  constructor(
    private readonly profileCreateService: CreateProfileService,
    private readonly profileGetAllService: GetAllProfilesService,
    private readonly profileDeleteService: DeleteProfileService,
    private readonly updateProfileService: UpdateProfileService,
  ) {}

  @ApiBearerAuth()
  @UseGuards(AuthLoginRequired)
  @Permissions('profile.create')
  @Post()
  async create(@Body() req: CreateProfileRequestDTO) {
    return await this.profileCreateService.execute(req);
  }

  @ApiBearerAuth()
  @UseGuards(AuthLoginRequired)
  @Permissions('profile.read')
  @Get()
  async findAll(
    @Query() filters: GetAllProfilesRequestDTO,
  ): Promise<GetAllProfilesResponseDTO[]> {
    return await this.profileGetAllService.execute(filters);
  }

  @ApiBearerAuth()
  @UseGuards(AuthLoginRequired)
  @Permissions('profile.delete')
  @Delete(':id')
  async delete(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ResponseDefaultDTO> {
    return await this.profileDeleteService.execute(id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthLoginRequired)
  @Permissions('profile.update')
  @Post(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() req: UpdateProfileRequestDTO 
  ): Promise<ResponseDefaultDTO> {
    return await this.updateProfileService.execute(id, req);
  }
}
