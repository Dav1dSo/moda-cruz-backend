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
  CreateCouponRequestDTO,
  GetAllCouponsFiltersDTO,
  UpdateCouponRequestDTO,
} from './dtos/request/coupon-request';
import {
  GetAllCouponsResponseDTO,
  GetCouponResponseDTO,
} from './dtos/response/coupon-response';
import { ResponseDefaultDTO } from '@shared/dtos';
import { CreateCouponUseCase } from './application/use-cases/create-coupon.use-case';
import { GetAllCouponsUseCase } from './application/use-cases/get-all-coupons.use-case';
import { FindCouponUseCase } from './application/use-cases/find-coupon.use-case';
import { UpdateCouponUseCase } from './application/use-cases/update-coupon.use-case';
import { DeleteCouponUseCase } from './application/use-cases/delete-coupon.use-case';
import { AuthLoginRequiredGuard } from '../../auth/guards/auth-login-required.guard';
import { Permissions } from '../../auth/decorators/permissions.decorator';

@Controller('coupons')
export class CouponsController {
  constructor(
    private readonly createCouponUseCase: CreateCouponUseCase,
    private readonly getAllCouponsUseCase: GetAllCouponsUseCase,
    private readonly findCouponUseCase: FindCouponUseCase,
    private readonly updateCouponUseCase: UpdateCouponUseCase,
    private readonly deleteCouponUseCase: DeleteCouponUseCase,
  ) {}

  @ApiBearerAuth()
  @UseGuards(AuthLoginRequiredGuard)
  @Permissions('coupon.read')
  @Get()
  async findAll(
    @Query() filters: GetAllCouponsFiltersDTO,
  ): Promise<GetAllCouponsResponseDTO[]> {
    return await this.getAllCouponsUseCase.execute(filters);
  }

  @ApiBearerAuth()
  @UseGuards(AuthLoginRequiredGuard)
  @Permissions('coupon.create')
  @Post()
  async create(
    @Body() req: CreateCouponRequestDTO,
  ): Promise<ResponseDefaultDTO> {
    return await this.createCouponUseCase.execute(req);
  }

  @ApiBearerAuth()
  @UseGuards(AuthLoginRequiredGuard)
  @Permissions('coupon.read')
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID do cupom',
    example: 1,
  })
  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<GetCouponResponseDTO> {
    return await this.findCouponUseCase.execute(id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthLoginRequiredGuard)
  @Permissions('coupon.update')
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID do cupom',
    example: 1,
  })
  @Put(':id')
  async updateCoupon(
    @Param('id', ParseIntPipe) id: number,
    @Body() req: UpdateCouponRequestDTO,
  ): Promise<ResponseDefaultDTO> {
    return await this.updateCouponUseCase.execute(req, id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthLoginRequiredGuard)
  @Permissions('coupon.delete')
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID do cupom',
    example: 1,
  })
  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ResponseDefaultDTO> {
    return await this.deleteCouponUseCase.execute(id);
  }
}
