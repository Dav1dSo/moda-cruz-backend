import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthLoginRequired } from '../../auth/guards/auth.guard';
import { Permissions } from '../../auth/decorators/permissions-decorator';
import { ApiBearerAuth, ApiBody, ApiConsumes } from '@nestjs/swagger';
import { ResponseDefaultDTO } from 'apps/api/src/shared/shared.dtos';
import { UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateNaturalPersonRequestDTO } from './dto/request/natural-person-request.dto';

@Controller('secretaria/natural-persons')
export class NaturalPersonController {
  constructor(
    private readonly createNaturalPersonUseCase: CreateNaturalPersonUseCase,
  ) {}

  @ApiBearerAuth()
  @UseGuards(AuthLoginRequired)
  @Permissions('natural_person.create')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        nome: {
          type: 'string',
        },
        photo: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('photo'))
  @Post()
  async create_natural_person(
    @Body() req: CreateNaturalPersonRequestDTO,
    @UploadedFile() photo: File,
  ): Promise<ResponseDefaultDTO> {
    return await this.createNaturalPersonUseCase.execute(req, photo);
  }
}
