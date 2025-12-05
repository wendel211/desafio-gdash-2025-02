import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { UsersService } from './users/users.service';

import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS
  app.enableCors({
    origin: '*',
    credentials: false,
  });

  // ✅ PREFIXO GLOBAL - Todas as rotas terão /api
  app.setGlobalPrefix('api');

  // Validation
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // 🔥 SWAGGER CONFIG
  const config = new DocumentBuilder()
    .setTitle('GDASH Weather API')
    .setDescription(
      'Documentação da API do GDASH — Autenticação, Usuários, Logs Climáticos e Insights de IA.'
    )
    .setVersion('1.0.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      description: 'Insira o token JWT gerado no login.',
    })
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // ✅ SWAGGER em /docs (não em /api)
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  // Admin auto-create
  const usersService = app.get(UsersService);
  await usersService.ensureAdminUser();

  // Start app
  await app.listen(3000);
  console.log(`🚀 API rodando em http://localhost:3000/api`);
  console.log(`📄 Swagger disponível em http://localhost:3000/docs`);
}
bootstrap();