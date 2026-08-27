/* eslint-disable @typescript-eslint/no-explicit-any */
import { Test } from '@nestjs/testing';
import { describe, expect, it, beforeAll } from 'vitest';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { AuditModule } from './audit.module';
import { AuditService } from './audit.service';

describe('FND-08 Audit append-only + sanitasi', () => {
  let audit: AuditService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env.local', '.env'], validate: (c: any) => c }), PrismaModule, AuditModule],
    }).compile();
    audit = moduleRef.get(AuditService);
    audit.clearMemory();
  });

  it('log append-only: actor/entity/event/time/scope tercatat', async () => {
    await audit.log({
      actorId: 'u1',
      actorEmail: 'bod1@dashboard.test',
      actorRole: 'BOD',
      action: 'auth.login',
      entity: 'User',
      entityId: 'u1',
      divisionCode: 'WRAP',
      traceId: 'trace-123',
      metadata: { email: 'bod1@dashboard.test', ip: '127.0.0.1' },
    });
    const logs = audit.getMemoryLogs();
    expect(logs.length).toBe(1);
    expect(logs[0]!.action).toBe('auth.login');
    expect(logs[0]!.actorId).toBe('u1');
    expect(logs[0]!.divisionCode).toBe('WRAP');
    expect(logs[0]!.traceId).toBe('trace-123');
  });

  it('sanitasi: password/token tidak masuk metadata', async () => {
    audit.clearMemory();
    await audit.log({
      actorId: 'u2',
      action: 'auth.login',
      entity: 'User',
      metadata: { email: 'a@test.test', password: 'rahasia', token: 'secret-jwt', nested: { passwordHash: 'hash', ok: 1 } } as any,
    });
    const logs = audit.getMemoryLogs();
    const meta = (logs[0]!.metadata as any);
    expect(meta.password).toBeUndefined();
    expect(meta.token).toBeUndefined();
    expect(meta.nested?.passwordHash).toBeUndefined();
    expect(meta.email).toBe('a@test.test');
    expect(meta.nested?.ok).toBe(1);
  });

  it('append-only: tidak ada update/delete, hanya create', async () => {
    audit.clearMemory();
    await audit.log({ action: 'test.create', entity: 'Test', metadata: { a: 1 } });
    await audit.log({ action: 'test.create', entity: 'Test', metadata: { a: 2 } });
    const logs = audit.getMemoryLogs();
    expect(logs.length).toBe(2);
    expect(logs[0]!.metadata).toEqual({ a: 1 });
    expect(logs[1]!.metadata).toEqual({ a: 2 });
    // ensure service has no update/delete methods exposed as append-only
    expect((audit as any).update).toBeUndefined();
    expect((audit as any).delete).toBeUndefined();
  });

  it('findAll mengembalikan logs terbaru', async () => {
    const all = await audit.findAll(10);
    expect(Array.isArray(all)).toBe(true);
    expect(all.length).toBeGreaterThanOrEqual(2);
  });
});
