import { PrismaService } from '@app/database';
import { Injectable } from '@nestjs/common';

@Injectable()
export class LegalPersonRepository {
  constructor(private readonly db: PrismaService) {}
  
}
