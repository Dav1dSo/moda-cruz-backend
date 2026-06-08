import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import {
  CreateUserRequestDTO,
  GetAllUsersFiltersDTO,
  GetAllUsersResponseDTO,
  GetUserResponseDTO,
} from './dtos/users.dto';
import { ResponseDefaultDTO } from '../shared/shared.dtos';
import { UsersServiceCreate } from './create-users.service';
import { UserServiceGetAll } from './getall-users.service';
import { FindUserService } from './find-user.service';
import { ApiParam } from '@nestjs/swagger';
import { UserServiceDelete } from './delete-user.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly userServiceCreate: UsersServiceCreate,
    private readonly userServiceGetAll: UserServiceGetAll,
    private readonly userServiceFind: FindUserService,
    private readonly userServiceDelete: UserServiceDelete,
  ) {}

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
