import compress from '@fastify/compress';
import helmet from '@fastify/helmet';
import { Logger as NestLogger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { EnvService } from './env/env.service';
async function bootstrap() {
  const adapter = new FastifyAdapter();
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    adapter,
  );
  const env = app.get(EnvService);

  app.enableCors({
    origin: true,
    credentials: true,
  });
  app.useLogger(app.get(Logger));
  app.setGlobalPrefix(env.API_BASE_PATH);
  app.useGlobalPipes(
    new ValidationPipe({
      disableErrorMessages: false,
      transform: true,
      validationError: {
        target: false,
        value: false,
      },
    }),
  );

  app.register(helmet, {
    frameguard: false,
    dnsPrefetchControl: {
      allow: true,
    },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: [`'self'`],
        styleSrc: [`'self'`, `'unsafe-inline'`],
        imgSrc: [`'self'`, 'data:', 'validator.swagger.io'],
        scriptSrc: [`'self'`, `https: 'unsafe-inline'`],
      },
    },
  });

  app.register(compress);

  // OpenAPI Specs
  const config = new DocumentBuilder()
    .setTitle('Assets Management Backend')
    .setDescription('The Assets Management Backend API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup(`${env.API_BASE_PATH}/docs`, app, document);

  await app.listen(
    env.PORT,
    '0.0.0.0',
    (err: Error | null, address: string) => {
      if (err) {
        NestLogger.error({ err }, 'Error starting server');
        process.exit(1);
      }

      NestLogger.log(`App listening on ${address}`);
    },
  );
}

bootstrap();
