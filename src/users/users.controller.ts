import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import {
  CreateUserRequestDTO,
  GetAllUsersResponseDTO,
  GetUserResponseDTO,
} from './dtos/users.dto';
import { ResponseDefaultDTO } from '../shared/shared.dtos';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get()
  findAll(): GetAllUsersResponseDTO {
    return {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@example.com',
      createdAt: new Date().toISOString(),
    };
  }

  @Post()
  async create(
    @Body() userData: CreateUserRequestDTO,
  ): Promise<ResponseDefaultDTO> {
    await this.userService.create(userData);
    return {
      message: 'User created successfully',
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: ParseIntPipe): Promise<GetUserResponseDTO> {
    return {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@example.com',
      createdAt: new Date().toISOString(),
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: ParseIntPipe): Promise<ResponseDefaultDTO> {
    return {
      message: 'User deleted successfully',
    };
  }
}
