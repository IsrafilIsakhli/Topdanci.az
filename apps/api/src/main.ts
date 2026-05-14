import 'reflect-metadata';

import helmet from 'helmet';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { RequestLoggingInterceptor } from './common/interceptors/request-logging.interceptor';
import { RequestIdInterceptor } from './common/interceptors/request-id.interceptor';
import { MetricsService } from './common/metrics/metrics.service';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const config = app.get(ConfigService);
  const webOrigin = config.get<string>('WEB_ORIGIN', 'http://localhost:3000');

  app.setGlobalPrefix('api');
  app.enableShutdownHooks();
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new RequestIdInterceptor(), new RequestLoggingInterceptor(app.get(MetricsService)));

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  app.enableCors({
    origin: webOrigin.split(',').map((origin) => origin.trim()),
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  if (config.get('NODE_ENV') !== 'production') {
    const documentConfig = new DocumentBuilder()
      .setTitle('TopdanBazar API')
      .setDescription('B2B wholesale lead-generation marketplace API')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, documentConfig));
  }

  const port = Number(config.get('PORT', 4000));
  await app.listen(port);
}

void bootstrap();
