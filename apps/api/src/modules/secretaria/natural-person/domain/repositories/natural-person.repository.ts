import { PrismaService } from '@app/database';
import { Injectable } from '@nestjs/common';

@Injectable()
export class NaturalPersonRepository {
  constructor(private readonly db: PrismaService) {}

  
}
