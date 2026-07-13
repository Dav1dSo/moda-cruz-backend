import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const frontendUrl = process.env.FRONTEND_URL;

  if (!frontendUrl) {
    throw new Error('FRONTEND_URL não configurado');
  }

  const trustProxyHops = Number(process.env.TRUST_PROXY_HOPS ?? 0);

  if (Number.isNaN(trustProxyHops)) {
    throw new Error('TRUST_PROXY_HOPS inválido: deve ser um número');
  }

  app.set('trust proxy', trustProxyHops);

  app.enableCors({
    origin: frontendUrl,
    credentials: true,
  });
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('API Gateway')
      .setDescription('Gateway HTTP da plataforma')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  await app.listen(process.env.PORT ?? 5555);
  new Logger('Bootstrap').log(`API Gateway running on: ${await app.getUrl()}`);
}

void bootstrap();
