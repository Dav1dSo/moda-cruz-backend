import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiParam } from '@nestjs/swagger';
import { GetAllPublicProductsUseCase } from './application/use-cases/get-all-public-products.use-case';
import { FindPublicProductUseCase } from './application/use-cases/find-public-product.use-case';
import { GetAllPublicProductsFiltersDTO } from './dtos/request/public-product-request';
import {
  GetAllPublicProductsResponseDTO,
  GetPublicProductResponseDTO,
} from './dtos/response/public-product-response';

@Controller('catalog/products')
export class PublicProductsController {
  constructor(
    private readonly getAllPublicProductsUseCase: GetAllPublicProductsUseCase,
    private readonly findPublicProductUseCase: FindPublicProductUseCase,
  ) {}

  @Get()
  async findAll(
    @Query() filters: GetAllPublicProductsFiltersDTO,
  ): Promise<GetAllPublicProductsResponseDTO> {
    return await this.getAllPublicProductsUseCase.execute(filters);
  }

  @ApiParam({
    name: 'slug',
    type: String,
    description: 'Slug do produto',
    example: 'terno-azul-marinho',
  })
  @Get(':slug')
  async findOne(
    @Param('slug') slug: string,
  ): Promise<GetPublicProductResponseDTO> {
    return await this.findPublicProductUseCase.execute(slug);
  }
}
