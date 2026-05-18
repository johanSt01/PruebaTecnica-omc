import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ── Prefijo global ────────────────────────────────────────────────────────
  app.setGlobalPrefix('api');

  // ── Validación global ─────────────────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // elimina campos no declarados en el DTO
      forbidNonWhitelisted: true,
      transform: true, // convierte query params al tipo correcto
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // ── Filtro de excepciones global ──────────────────────────────────────────
  app.useGlobalFilters(new AllExceptionsFilter());

  // ── CORS ──────────────────────────────────────────────────────────────────
  app.enableCors();

  // ── Swagger / OpenAPI ─────────────────────────────────────────────────────
  const swaggerConfig = new DocumentBuilder()
    .setTitle('OMC Leads API')
    .setDescription(
      'API REST para gestión de leads — One Million Copy SAS\n\n' +
        '**Credenciales de prueba:** usuario `admin` / contraseña `omc2024`\n\n' +
        'Haz login en `/api/v1/auth/login`, copia el token y úsalo con el botón **Authorize**.',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  console.log(`\nAPI corriendo en: http://localhost:${port}/api/v1`);
  console.log(`Swagger docs:     http://localhost:${port}/docs\n`);
}

bootstrap();
