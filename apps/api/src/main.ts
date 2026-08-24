import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { validateEnv } from './config/env-validation';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const appConfig = validateEnv(process.env);
  const app = await NestFactory.create(AppModule);
  await app.listen(appConfig.PORT);
}

void bootstrap();
