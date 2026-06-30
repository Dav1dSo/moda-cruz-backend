import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { NOTIFICATIONS_QUEUE } from '@contracts/auth/reset-password-requested.event';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.connectMicroservice<MicroserviceOptions>({
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
      noAck: true,
      prefetchCount: 1,
    },
  });

  app.enableShutdownHooks();
  await app.startAllMicroservices();

  console.log('Serviço de notificações iniciado');
}

void bootstrap();
