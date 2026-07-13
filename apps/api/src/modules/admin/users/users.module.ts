import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { UsersController } from './users.controller';
import { GetAllUsersUseCase } from './application/use-cases/get-all-users.use-case';
import { FindUserUseCase } from './application/use-cases/find-user.use-case';
import { DeleteUserUseCase } from './application/use-cases/delete-user.use-case';
import { UpdateUserUseCase } from './application/use-cases/update-user.use-case';
import { AuthModule } from '../../auth/auth.module';
import { CreateUserUseCase } from './application/use-cases/create-user.use-case';
import { UserRepository } from './infrastructure/repositories/user.repository';
import {
  NOTIFICATIONS_CLIENT,
  NOTIFICATIONS_QUEUE_ARGUMENTS,
  NOTIFICATIONS_QUEUE,
} from '@contracts/notifications';

@Module({
  imports: [
    AuthModule,
    ClientsModule.registerAsync([
      {
        name: NOTIFICATIONS_CLIENT,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => {
          const rabbitmqUrl = configService.get<string>('RABBITMQ_URL');

          if (!rabbitmqUrl) {
            throw new Error('RABBITMQ_URL não configurado');
          }

          return {
            transport: Transport.RMQ,
            options: {
              urls: [rabbitmqUrl],
              queue: NOTIFICATIONS_QUEUE,
              queueOptions: {
                durable: true,
                arguments: NOTIFICATIONS_QUEUE_ARGUMENTS,
              },
              persistent: true,
            },
          };
        },
      },
    ]),
  ],
  controllers: [UsersController],
  providers: [
    GetAllUsersUseCase,
    CreateUserUseCase,
    FindUserUseCase,
    DeleteUserUseCase,
    UpdateUserUseCase,
    UserRepository,
  ],
})
export class UsersModule {}
