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
import { ApiBearerAuth } from '@nestjs/swagger';
import { ResponseDefaultDTO } from '../../../shared/shared.dtos';
import { Permissions } from '../../auth/decorators/permissions-decorator';
import { AuthLoginRequired } from '../../auth/guards/auth.guard';
import {
  LegalPersonFiltersDTO,
  LegalPersonRequestDTO,
} from './dto/request/legal-person-request.dto';
import { GetAllLegalPersonsResponseDTO } from './dto/response/legal-person-response.dto';

@ApiBearerAuth()
@UseGuards(AuthLoginRequired)
@Controller('secretaria/legal-persons')
export class LegalPersonController {
  constructor(
    private readonly listUseCase: ListLegalPersonsUseCase,
    private readonly getUseCase: GetLegalPersonUseCase,
    private readonly createUseCase: CreateLegalPersonUseCase,
    private readonly updateUseCase: UpdateLegalPersonUseCase,
    private readonly deleteUseCase: DeleteLegalPersonUseCase,
  ) {}
  @Permissions('legal_person.read') @Get() list(
    @Query() filters: LegalPersonFiltersDTO,
  ): Promise<GetAllLegalPersonsResponseDTO> {
    return this.listUseCase.execute(filters);
  }
  @Permissions('legal_person.read') @Get(':id') get(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<LegalPersonDetails> {
    return this.getUseCase.execute(id);
  }
  @Permissions('legal_person.create') @Post() create(
    @Body() req: LegalPersonRequestDTO,
  ): Promise<ResponseDefaultDTO> {
    return this.createUseCase.execute(req);
  }
  @Permissions('legal_person.update') @Put(':id') update(
    @Param('id', ParseIntPipe) id: number,
    @Body() req: LegalPersonRequestDTO,
  ): Promise<ResponseDefaultDTO> {
    return this.updateUseCase.execute(id, req);
  }
  @Permissions('legal_person.delete') @Delete(':id') remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ResponseDefaultDTO> {
    return this.deleteUseCase.execute(id);
  }
}
