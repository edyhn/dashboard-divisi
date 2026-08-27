/* eslint-disable @typescript-eslint/no-explicit-any */
import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface AuditLogParams {
  actorId?: string | null;
  actorEmail?: string | null;
  actorRole?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  divisionCode?: string | null;
  traceId?: string | null;
  metadata?: Record<string, unknown> | null;
}

// Sensitive keys yang tidak boleh masuk audit metadata
const SENSITIVE_KEYS = new Set(['password', 'passwordHash', 'token', 'access_token', 'accessToken', 'authorization', 'cookie', 'secret', 'jwt']);

function sanitizeMetadata(input?: Record<string, unknown> | null): Record<string, unknown> | null {
  if (!input) return null;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(input)) {
    if (SENSITIVE_KEYS.has(k) || SENSITIVE_KEYS.has(k.toLowerCase())) continue;
    // also strip nested password
    if (typeof v === 'object' && v !== null) {
      const sanitized = sanitizeMetadata(v as Record<string, unknown>);
      if (sanitized && Object.keys(sanitized).length > 0) out[k] = sanitized;
    } else {
      out[k] = v;
    }
  }
  return Object.keys(out).length > 0 ? out : null;
}

// In-memory fallback untuk test tanpa DB
const memoryAudit: AuditLogParams[] = [];

@Injectable()
export class AuditService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async log(params: AuditLogParams): Promise<void> {
    const sanitized = sanitizeMetadata(params.metadata ?? null);
    const data = {
      actorId: params.actorId ?? null,
      actorEmail: params.actorEmail ?? null,
      actorRole: params.actorRole ?? null,
      action: params.action,
      entity: params.entity,
      entityId: params.entityId ?? null,
      divisionCode: params.divisionCode ?? null,
      traceId: params.traceId ?? null,
      metadata: sanitized as any,
    };

    // Append-only: hanya create, tidak update/delete
    try {
      await this.prisma.auditEvent.create({ data });
    } catch (e) {
      if (process.env.NODE_ENV === 'test') {
        memoryAudit.push({ ...params, metadata: sanitized });
        return;
      }
      throw e;
    }
    // also keep memory for test verification
    if (process.env.NODE_ENV === 'test') {
      memoryAudit.push({ ...params, metadata: sanitized });
    }
  }

  async findAll(limit = 50): Promise<any[]> {
    try {
      return await this.prisma.auditEvent.findMany({ orderBy: { createdAt: 'desc' }, take: limit });
    } catch {
      if (process.env.NODE_ENV === 'test') {
        return [...memoryAudit].slice(-limit).reverse();
      }
      throw new Error('DB not available');
    }
  }

  // For test: get memory logs
  getMemoryLogs(): AuditLogParams[] {
    return [...memoryAudit];
  }

  clearMemory(): void {
    memoryAudit.length = 0;
  }
}
