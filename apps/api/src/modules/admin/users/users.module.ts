import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { UsersController } from './users.controller';
import { GetAllUsersUseCase } from './application/use-cases/getall-users.use-case';
import { FindUserUseCase } from './application/use-cases/find-user.use-case';
import { DeleteUserUseCase } from './application/use-cases/delete-user.use-case';
import { UpdateUserUseCase } from './application/use-cases/update-user.use-case';
import { AuthModule } from '../../auth/auth.module';
import { CreateUserUseCase } from './application/use-cases/create-users.use-case';
import { UserRepository } from './domain/repositories/users.repository';
import {
  NOTIFICATIONS_CLIENT,
  NOTIFICATIONS_QUEUE,
} from '@contracts/auth/reset-password-requested.event';

@Module({
  imports: [
    AuthModule,
    ClientsModule.registerAsync([
      {
        name: NOTIFICATIONS_CLIENT,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [
              configService.get<string>('RABBITMQ_URL') ??
                'amqp://admin:admin123@localhost:5672',
            ],
            queue: NOTIFICATIONS_QUEUE,
            queueOptions: {
              durable: true,
            },
            persistent: true,
          },
        }),
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
