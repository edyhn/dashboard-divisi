import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import { AppModule } from '../app.module';
import { configureApp } from '../app.setup';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

export interface TestHarness {
  app: INestApplication;
  baseUrl: string;
  prisma: PrismaService;
  audit: AuditService;
  cleanup: () => Promise<void>;
}

/**
 * Test harness — isolated per suite, repeatable, anonim fixtures.
 * - Creates fresh Nest app per caller (isolated, tidak bergantung urutan)
 * - PrismaService fallback to memory in test (no DB required) — tetap isolated via clearMemory
 * - Audit memory cleared per harness
 */
export async function createTestHarness(): Promise<TestHarness> {
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
  const app = moduleRef.createNestApplication();
  configureApp(app);
  await app.listen(0);
  const url = await app.getUrl();
  const port = Number(url.match(/:(\d+)$/)?.[1]);
  const baseUrl = `http://127.0.0.1:${port}`;

  const prisma = moduleRef.get(PrismaService);
  const audit = moduleRef.get(AuditService);
  // isolate: clear audit memory
  audit.clearMemory();

  const cleanup = async () => {
    await app.close();
  };

  return { app, baseUrl, prisma, audit, cleanup };
}

/**
 * Helper untuk test yang butuh DB isolation via transaction rollback (jika DB tersedia).
 * Untuk MVP tanpa DB, cukup pakai createTestHarness() yang sudah isolated via memory.
 */
export async function withIsolatedTest<T>(fn: (harness: TestHarness) => Promise<T>): Promise<T> {
  const harness = await createTestHarness();
  try {
    return await fn(harness);
  } finally {
    await harness.cleanup();
  }
}
