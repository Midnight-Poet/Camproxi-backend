import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true, // 👈 Enables automatic type conversion for nested objects
      },
    }),
  );

  app.use(cookieParser());

  app.enableCors({
    origin: [
      process.env.AGENT_URL || 'http://localhost:3000',
      process.env.STUDENT_URL || 'http://localhost:3001',
    ],
    credentials: true,
  });

  const PORT = process.env.PORT || 3000;
  await app.listen(PORT, '0.0.0.0');
  console.log(`🚀 Camproxi Unified API running on port: ${PORT}`);
}
bootstrap();
