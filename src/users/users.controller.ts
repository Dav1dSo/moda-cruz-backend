import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  CreateUserRequestDTO,
  UpdateUserRequestDTO,
} from './dtos/request/user-request';
import { ResponseDefaultDTO } from '../shared/shared.dtos';
import { UsersServiceCreate } from './create-users.service';
import { UserServiceGetAll } from './getall-users.service';
import { FindUserService } from './find-user.service';
import { ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { UserServiceDelete } from './delete-user.service';
import {
  GetAllUsersFiltersDTO,
  GetAllUsersResponseDTO,
  GetUserResponseDTO,
} from './dtos/response/user-response';
import { UserServiceUpdate } from './update-user.service';
import { AuthLoginrequired } from 'src/auth/guards/auth.guard';
import { Permissions } from 'src/auth/decorators/permissions-decorator';

@Controller('users')
export class UsersController {
  constructor(
    private readonly userServiceCreate: UsersServiceCreate,
    private readonly userServiceGetAll: UserServiceGetAll,
    private readonly userServiceFind: FindUserService,
    private readonly userServiceDelete: UserServiceDelete,
    private readonly userServiceUpdate: UserServiceUpdate,
  ) {}

  @ApiBearerAuth()
  @UseGuards(AuthLoginrequired)
  @Permissions('user.read')
  @Get()
  async findAll(
    @Query() filters: GetAllUsersFiltersDTO,
  ): Promise<GetAllUsersResponseDTO[]> {
    return await this.userServiceGetAll.execute(filters);
  }

  @Post()
  async create(
    @Body() userData: CreateUserRequestDTO,
  ): Promise<ResponseDefaultDTO> {
    await this.userServiceCreate.execute(userData);
    return {
      message: 'User created successfully',
    };
  }

  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID do usuário',
    example: 1,
  })
  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<GetUserResponseDTO | null> {
    return await this.userServiceFind.execute(id);
  }

  @Post()
  async aupdateUser(
    @Param(':id', ParseIntPipe) user_id: number,
    @Body() req: UpdateUserRequestDTO,
  ): Promise<ResponseDefaultDTO> {
    return await this.userServiceUpdate.execute(req, user_id);
  }

  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID do usuário',
    example: 1,
  })
  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ResponseDefaultDTO> {
    return await this.userServiceDelete.execute(id);
  }
}
