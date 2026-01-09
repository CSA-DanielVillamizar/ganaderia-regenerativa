import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
    // ValidationPipe global
    const app = await NestFactory.create(AppModule);
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );
  console.log('🚀 Iniciando aplicación...');
  console.log(`📌 Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📌 DB: ${process.env.DATABASE_URL || 'no configurada'}`);

  console.log('✅ AppModule cargado');

  // CORS
  app.enableCors({
    origin: (origin, callback) => {
      const allowed = [
        'http://localhost:3000',
        'http://localhost:3001',
        process.env.CORS_ORIGIN,
      ].filter(Boolean) as string[];

      if (!origin || allowed.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`Origen no permitido: ${origin}`));
    },
    credentials: true,
  });

  // Prefijo global
  app.setGlobalPrefix('api/v1');

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('Rotación Ganado API')
    .setDescription('API premium para gestión de ganadería regenerativa')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  console.log(`✅ CORS habilitado para: ${process.env.CORS_ORIGIN}`);
  console.log(`✅ Global prefix: api/v1`);
  console.log(`✅ Swagger en /api/docs`);
  await app.listen(port);
  console.log(`🎉 API escuchando en http://localhost:${port}`);
  console.log(`📚 Swagger disponible en http://localhost:${port}/api/docs`);
}

bootstrap().catch((err) => {
  console.error('❌ Error al iniciar la aplicación:');
  console.error(err);
  process.exit(1);
});
