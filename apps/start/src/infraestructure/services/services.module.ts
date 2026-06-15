import { Global, Module } from '@nestjs/common';
import { PrismaService } from '../../../../../libs/database/prisma.service';
import { EmailService } from '../../../../../libs/notification/email/email.service';

@Global()
@Module({
  imports: [],
  controllers: [],
  providers: [PrismaService, EmailService],
  exports: [PrismaService, EmailService],
})
export class SharedModule {}
