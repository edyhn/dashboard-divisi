import type { INestApplication } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { traceIdMiddleware } from './common/trace-id.middleware';
import { AllExceptionsFilter } from './common/all-exceptions.filter';
import { ApiEnvelopeInterceptor } from './common/api-envelope.interceptor';

export function configureApp(app: INestApplication): void {
  app.use(cookieParser());
  app.use(traceIdMiddleware);
  app.setGlobalPrefix('api/v1');
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new ApiEnvelopeInterceptor());
}
