import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { connect } from 'amqplib';
import {
  NOTIFICATIONS_DLQ,
  NOTIFICATIONS_QUEUE,
  NOTIFICATIONS_QUEUE_ARGUMENTS,
} from '@contracts/notifications';
import { AppModule } from './app.module';

async function assertQueueTopology(rabbitmqUrl: string): Promise<void> {
  const connection = await connect(rabbitmqUrl);

  try {
    const channel = await connection.createChannel();
    await channel.assertQueue(NOTIFICATIONS_DLQ, { durable: true });
    await channel.assertQueue(NOTIFICATIONS_QUEUE, {
      durable: true,
      arguments: NOTIFICATIONS_QUEUE_ARGUMENTS,
    });
    await channel.close();
  } catch (error) {
    throw new Error(
      `Fila "${NOTIFICATIONS_QUEUE}" já existe no broker com configuração incompatível com a dead-letter queue. ` +
        `Migração necessária: esvazie e delete a fila "${NOTIFICATIONS_QUEUE}" (management UI ou rabbitmqctl) e suba o serviço novamente.`,
      { cause: error },
    );
  } finally {
    await connection.close();
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const rabbitmqUrl = configService.get<string>('RABBITMQ_URL');

  if (!rabbitmqUrl) {
    throw new Error('RABBITMQ_URL não configurado');
  }

  await assertQueueTopology(rabbitmqUrl);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [rabbitmqUrl],
      queue: NOTIFICATIONS_QUEUE,
      queueOptions: {
        durable: true,
        arguments: NOTIFICATIONS_QUEUE_ARGUMENTS,
      },
      noAck: false,
      prefetchCount: 1,
    },
  });

  app.enableShutdownHooks();
  await app.startAllMicroservices();

  new Logger('Bootstrap').log('Serviço de notificações iniciado');
}

void bootstrap();
