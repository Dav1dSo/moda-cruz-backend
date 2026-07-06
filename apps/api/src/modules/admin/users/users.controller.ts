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
import {
  CreateUserRequestDTO,
  GetAllUsersFiltersDTO,
  UpdateUserRequestDTO,
} from './dtos/request/user-request';
import { ResponseDefaultDTO } from '../../../shared/shared.dtos';
import { GetAllUsersUseCase } from './application/use-cases/get-all-users.use-case';
import { FindUserUseCase } from './application/use-cases/find-user.use-case';
import { ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { DeleteUserUseCase } from './application/use-cases/delete-user.use-case';
import {
  GetAllUsersResponseDTO,
  GetUserResponseDTO,
} from './dtos/response/user-response';
import { UpdateUserUseCase } from './application/use-cases/update-user.use-case';
import { AuthLoginRequired } from '../../auth/guards/auth.guard';
import { Permissions } from '../../auth/decorators/permissions-decorator';
import { CreateUserUseCase } from './application/use-cases/create-user.use-case';

@Controller('users')
export class UsersController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly getAllUsersUseCase: GetAllUsersUseCase,
    private readonly findUserUseCase: FindUserUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
  ) {}

  @ApiBearerAuth()
  @UseGuards(AuthLoginRequired)
  @Permissions('user.read')
  @Get()
  async findAll(
    @Query() filters: GetAllUsersFiltersDTO,
  ): Promise<GetAllUsersResponseDTO[]> {
    return await this.getAllUsersUseCase.execute(filters);
  }

  @ApiBearerAuth()
  @UseGuards(AuthLoginRequired)
  @Permissions('user.create')
  @Post()
  async create(
    @Body() userData: CreateUserRequestDTO,
  ): Promise<ResponseDefaultDTO> {
    return await this.createUserUseCase.execute(userData);
  }

  @ApiBearerAuth()
  @UseGuards(AuthLoginRequired)
  @Permissions('user.read')
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
    return await this.findUserUseCase.execute(id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthLoginRequired)
  @Permissions('user.update')
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID do usuário',
    example: 1,
  })
  @Put(':id')
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() req: UpdateUserRequestDTO,
  ): Promise<ResponseDefaultDTO> {
    return await this.updateUserUseCase.execute(req, id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthLoginRequired)
  @Permissions('user.delete')
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
    return await this.deleteUserUseCase.execute(id);
  }
}
