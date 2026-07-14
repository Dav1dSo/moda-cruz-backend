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
  CreatePromotionRequestDTO,
  GetAllPromotionsFiltersDTO,
  UpdatePromotionRequestDTO,
} from './dtos/request/promotion-request';
import {
  GetAllPromotionsResponseDTO,
  GetPromotionResponseDTO,
} from './dtos/response/promotion-response';
import { ResponseDefaultDTO } from '@shared/dtos';
import { CreatePromotionUseCase } from './application/use-cases/create-promotion.use-case';
import { GetAllPromotionsUseCase } from './application/use-cases/get-all-promotions.use-case';
import { FindPromotionUseCase } from './application/use-cases/find-promotion.use-case';
import { UpdatePromotionUseCase } from './application/use-cases/update-promotion.use-case';
import { DeletePromotionUseCase } from './application/use-cases/delete-promotion.use-case';
import { AuthLoginRequiredGuard } from '../../auth/guards/auth-login-required.guard';
import { Permissions } from '../../auth/decorators/permissions.decorator';

@Controller('promotions')
export class PromotionsController {
  constructor(
    private readonly createPromotionUseCase: CreatePromotionUseCase,
    private readonly getAllPromotionsUseCase: GetAllPromotionsUseCase,
    private readonly findPromotionUseCase: FindPromotionUseCase,
    private readonly updatePromotionUseCase: UpdatePromotionUseCase,
    private readonly deletePromotionUseCase: DeletePromotionUseCase,
  ) {}

  @ApiBearerAuth()
  @UseGuards(AuthLoginRequiredGuard)
  @Permissions('promotion.read')
  @Get()
  async findAll(
    @Query() filters: GetAllPromotionsFiltersDTO,
  ): Promise<GetAllPromotionsResponseDTO[]> {
    return await this.getAllPromotionsUseCase.execute(filters);
  }

  @ApiBearerAuth()
  @UseGuards(AuthLoginRequiredGuard)
  @Permissions('promotion.create')
  @Post()
  async create(
    @Body() req: CreatePromotionRequestDTO,
  ): Promise<ResponseDefaultDTO> {
    return await this.createPromotionUseCase.execute(req);
  }

  @ApiBearerAuth()
  @UseGuards(AuthLoginRequiredGuard)
  @Permissions('promotion.read')
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID da promoção',
    example: 1,
  })
  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<GetPromotionResponseDTO> {
    return await this.findPromotionUseCase.execute(id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthLoginRequiredGuard)
  @Permissions('promotion.update')
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID da promoção',
    example: 1,
  })
  @Put(':id')
  async updatePromotion(
    @Param('id', ParseIntPipe) id: number,
    @Body() req: UpdatePromotionRequestDTO,
  ): Promise<ResponseDefaultDTO> {
    return await this.updatePromotionUseCase.execute(req, id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthLoginRequiredGuard)
  @Permissions('promotion.delete')
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID da promoção',
    example: 1,
  })
  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ResponseDefaultDTO> {
    return await this.deletePromotionUseCase.execute(id);
  }
}
