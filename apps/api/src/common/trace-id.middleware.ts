import { randomUUID } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';

export const TRACE_ID_HEADER = 'X-Trace-Id' as const;

export function traceIdMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  req.traceId = randomUUID();
  res.setHeader(TRACE_ID_HEADER, req.traceId);
  next();
}