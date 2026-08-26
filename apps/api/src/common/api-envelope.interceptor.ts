import { randomUUID } from 'node:crypto';
import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  type NestInterceptor,
} from '@nestjs/common';
import type { Request } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import type { ApiSuccess } from '@dashboard-divisi/contracts';

@Injectable()
export class ApiEnvelopeInterceptor<T>
  implements NestInterceptor<T, ApiSuccess<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ApiSuccess<T>> {
    const req = context.switchToHttp().getRequest<Request>();
    const traceId = req.traceId ?? randomUUID();

    return next
      .handle()
      .pipe(
        map((data) => ({
          data,
          meta: { trace_id: traceId },
          links: { self: req.originalUrl },
        })),
      );
  }
}