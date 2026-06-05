import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { CreateUserRequestDTO } from './dtos/users.dto';
import { PrismaService } from 'src/infraestructure/services/database/prisma.service';
import { EmailService } from 'src/infraestructure/services/email/email.service';
import { welcomeUserTemplate } from 'src/infraestructure/services/email/templates/welcome-user';

@Injectable()
export class UsersService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly emailService: EmailService,
  ) {}


  async create(req: CreateUserRequestDTO): Promise<void> {
    try {
      if (
        await this.prismaService.user.findUnique({
          where: { email: req.email },
        })
      ) {
        throw new ConflictException('Email already exists');
      }

      await this.prismaService.$transaction(async (tx) => {
        await tx.user.create({
          data: {
            name: req.name,
            email: req.email,
            telefone: req.telefone,
            password: req.password,

            address: {
              create: {
                street: req.street,
                city: req.city,
                state: req.state,
                zipCode: req.zipCode,
                country: req.country,
                number: req.number,
              },
            },
          },
        });
      });

      await this.emailService.sendEmail(
        req.email,
        'Bem-vindo ao nosso serviço',
        welcomeUserTemplate(req.name),
        process.env.EMAIL_FROM || '',
      );
      
    } catch (error) {
      throw error
    }
  }
}
