import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { UsersController } from './users.controller';
import { UserServiceGetAll } from './getall-users.service';
import { FindUserService } from './find-user.service';
import { UserServiceDelete } from './delete-user.service';
import { UserServiceUpdate } from './update-user.service';
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
    UserServiceGetAll,
    CreateUserUseCase,
    FindUserService,
    UserServiceDelete,
    UserServiceUpdate,
    UserRepository,
  ],
})
export class UsersModule {}
