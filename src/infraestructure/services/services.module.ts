import { Global, Module } from '@nestjs/common';
import { PrismaService } from './database/prisma.service';
import { EmailService } from './email/email.service';

@Global()
@Module({
  imports: [],
  controllers: [],
  providers: [PrismaService, EmailService],
  exports: [PrismaService, EmailService],
})
export class SharedModule {}
