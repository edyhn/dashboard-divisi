import {
  ArgumentsHost,
  Catch,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { ExceptionFilter } from '@nestjs/common';
import type { Request, Response } from 'express';
import type { ApiFailure, FieldError } from '@dashboard-divisi/contracts';
import { randomUUID } from 'node:crypto';
import { ApiError, type ApiErrorCode } from './api-error';

const GENERIC_INTERNAL_MESSAGE = 'Terjadi kesalahan internal. Silakan coba lagi.';

const HTTP_STATUS_TO_CODE: Partial<Record<HttpStatus, ApiErrorCode>> = {
  [HttpStatus.BAD_REQUEST]: 'VALIDATION_ERROR',
  [HttpStatus.UNAUTHORIZED]: 'AUTH_REQUIRED',
  [HttpStatus.FORBIDDEN]: 'FORBIDDEN_CAPABILITY',
  [HttpStatus.NOT_FOUND]: 'RESOURCE_NOT_FOUND',
  [HttpStatus.CONFLICT]: 'INVALID_STATE_TRANSITION',
  [HttpStatus.TOO_MANY_REQUESTS]: 'RATE_LIMITED',
};

function extractHttpExceptionBody(exception: HttpException): {
  message: string;
  fields?: FieldError[];
} {
  const payload = exception.getResponse();
  if (typeof payload === 'string') {
    return { message: payload };
  }
  const body = payload as { message?: string | string[]; fields?: FieldError[] };
  const message = Array.isArray(body.message)
    ? body.message.join('; ')
    : (body.message ?? exception.message);
  return { message, fields: body.fields };
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const httpCtx = host.switchToHttp();
    const res = httpCtx.getResponse<Response>();
    const req = httpCtx.getRequest<Request>();

    const traceId = req.traceId ?? randomUUID();

    let httpStatus: number;
    let code: ApiErrorCode;
    let message: string;
    let fields: FieldError[] | undefined;

    if (exception instanceof ApiError) {
      httpStatus = exception.httpStatus;
      code = exception.code;
      message = exception.message;
      fields = exception.fields;
    } else if (exception instanceof HttpException) {
      const status = exception.getStatus();
      httpStatus = status;
      code = HTTP_STATUS_TO_CODE[status as HttpStatus] ?? 'INTERNAL_ERROR';
      const extracted = extractHttpExceptionBody(exception);
      message = extracted.message;
      fields = extracted.fields;
    } else {
      httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
      code = 'INTERNAL_ERROR';
      message = GENERIC_INTERNAL_MESSAGE;
    }

    if (code === 'INTERNAL_ERROR') {
      const stack =
        exception instanceof Error ? (exception.stack ?? '') : String(exception);
      this.logger.error(
        `Unhandled exception | trace_id=${traceId} | code=${code}`,
        stack,
      );
    }

    const body: ApiFailure = {
      error: {
        code,
        message,
        ...(fields ? { fields } : {}),
        trace_id: traceId,
      },
    };

    res.status(httpStatus).json(body);
  }
}