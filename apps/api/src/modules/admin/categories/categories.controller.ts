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
import {
  CreateCategoryRequestDTO,
  GetAllCategoriesFiltersDTO,
  UpdateCategoryRequestDTO,
} from './dtos/request/category-request';
import {
  GetAllCategoriesResponseDTO,
  GetCategoryResponseDTO,
} from './dtos/response/category-response';
import { ResponseDefaultDTO } from '@shared/dtos';
import { CreateCategoryUseCase } from './application/use-cases/create-category.use-case';
import { GetAllCategoriesUseCase } from './application/use-cases/get-all-categories.use-case';
import { FindCategoryUseCase } from './application/use-cases/find-category.use-case';
import { UpdateCategoryUseCase } from './application/use-cases/update-category.use-case';
import { DeleteCategoryUseCase } from './application/use-cases/delete-category.use-case';
import { AuthLoginRequiredGuard } from '../../auth/guards/auth-login-required.guard';
import { Permissions } from '../../auth/decorators/permissions.decorator';

@Controller('categories')
export class CategoriesController {
  constructor(
    private readonly createCategoryUseCase: CreateCategoryUseCase,
    private readonly getAllCategoriesUseCase: GetAllCategoriesUseCase,
    private readonly findCategoryUseCase: FindCategoryUseCase,
    private readonly updateCategoryUseCase: UpdateCategoryUseCase,
    private readonly deleteCategoryUseCase: DeleteCategoryUseCase,
  ) {}

  @ApiBearerAuth()
  @UseGuards(AuthLoginRequiredGuard)
  @Permissions('category.read')
  @Get()
  async findAll(
    @Query() filters: GetAllCategoriesFiltersDTO,
  ): Promise<GetAllCategoriesResponseDTO[]> {
    return await this.getAllCategoriesUseCase.execute(filters);
  }

  @ApiBearerAuth()
  @UseGuards(AuthLoginRequiredGuard)
  @Permissions('category.create')
  @Post()
  async create(
    @Body() req: CreateCategoryRequestDTO,
  ): Promise<ResponseDefaultDTO> {
    return await this.createCategoryUseCase.execute(req);
  }

  @ApiBearerAuth()
  @UseGuards(AuthLoginRequiredGuard)
  @Permissions('category.read')
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID da categoria',
    example: 1,
  })
  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<GetCategoryResponseDTO | null> {
    return await this.findCategoryUseCase.execute(id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthLoginRequiredGuard)
  @Permissions('category.update')
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID da categoria',
    example: 1,
  })
  @Put(':id')
  async updateCategory(
    @Param('id', ParseIntPipe) id: number,
    @Body() req: UpdateCategoryRequestDTO,
  ): Promise<ResponseDefaultDTO> {
    return await this.updateCategoryUseCase.execute(req, id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthLoginRequiredGuard)
  @Permissions('category.delete')
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID da categoria',
    example: 1,
  })
  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ResponseDefaultDTO> {
    return await this.deleteCategoryUseCase.execute(id);
  }
}
