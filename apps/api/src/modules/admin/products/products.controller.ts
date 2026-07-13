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
  CreateProductRequestDTO,
  GetAllProductsFiltersDTO,
  UpdateProductRequestDTO,
} from './dtos/request/product-request';
import {
  GetAllProductsResponseDTO,
  GetProductResponseDTO,
} from './dtos/response/product-response';
import { ResponseDefaultDTO } from '@shared/dtos';
import { CreateProductUseCase } from './application/use-cases/create-product.use-case';
import { GetAllProductsUseCase } from './application/use-cases/get-all-products.use-case';
import { FindProductUseCase } from './application/use-cases/find-product.use-case';
import { UpdateProductUseCase } from './application/use-cases/update-product.use-case';
import { DeleteProductUseCase } from './application/use-cases/delete-product.use-case';
import { AuthLoginRequiredGuard } from '../../auth/guards/auth-login-required.guard';
import { Permissions } from '../../auth/decorators/permissions.decorator';
import {
  CurrentUser,
  type JwtUserPayload,
} from '../../auth/decorators/current-user.decorator';

@Controller('products')
export class ProductsController {
  constructor(
    private readonly createProductUseCase: CreateProductUseCase,
    private readonly getAllProductsUseCase: GetAllProductsUseCase,
    private readonly findProductUseCase: FindProductUseCase,
    private readonly updateProductUseCase: UpdateProductUseCase,
    private readonly deleteProductUseCase: DeleteProductUseCase,
  ) {}

  @ApiBearerAuth()
  @UseGuards(AuthLoginRequiredGuard)
  @Permissions('product.read')
  @Get()
  async findAll(
    @Query() filters: GetAllProductsFiltersDTO,
  ): Promise<GetAllProductsResponseDTO[]> {
    return await this.getAllProductsUseCase.execute(filters);
  }

  @ApiBearerAuth()
  @UseGuards(AuthLoginRequiredGuard)
  @Permissions('product.create')
  @Post()
  async create(
    @Body() req: CreateProductRequestDTO,
    @CurrentUser() currentUser: JwtUserPayload,
  ): Promise<ResponseDefaultDTO> {
    return await this.createProductUseCase.execute(req, currentUser.sub);
  }

  @ApiBearerAuth()
  @UseGuards(AuthLoginRequiredGuard)
  @Permissions('product.read')
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID do produto',
    example: 1,
  })
  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<GetProductResponseDTO> {
    return await this.findProductUseCase.execute(id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthLoginRequiredGuard)
  @Permissions('product.update')
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID do produto',
    example: 1,
  })
  @Put(':id')
  async updateProduct(
    @Param('id', ParseIntPipe) id: number,
    @Body() req: UpdateProductRequestDTO,
    @CurrentUser() currentUser: JwtUserPayload,
  ): Promise<ResponseDefaultDTO> {
    return await this.updateProductUseCase.execute(req, id, currentUser.sub);
  }

  @ApiBearerAuth()
  @UseGuards(AuthLoginRequiredGuard)
  @Permissions('product.delete')
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID do produto',
    example: 1,
  })
  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ResponseDefaultDTO> {
    return await this.deleteProductUseCase.execute(id);
  }
}
