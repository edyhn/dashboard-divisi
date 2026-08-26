import { Controller, Get, Module } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { AppModule } from './app.module';
import { configureApp } from './app.setup';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const SECRET_MARKER = 'RAHASIA_DB_TIDAK_BOLEH_BOCOR';

@Controller('boom')
class BoomProbeController {
  @Get()
  explode(): never {
    throw new Error(`koneksi gagal: ${SECRET_MARKER}`);
  }
}

@Module({
  imports: [AppModule],
  controllers: [BoomProbeController],
})
class ContractTestModule {}

describe('Kontrak shell API (FND-03)', () => {
  let app: INestApplication;
  let baseUrl: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [ContractTestModule],
    }).compile();

    app = moduleRef.createNestApplication();
    configureApp(app);

    await app.listen(0);
    const rawUrl = await app.getUrl();
    const port = Number(rawUrl.match(/:(\d+)$/)?.[1]);
    expect(Number.isInteger(port)).toBe(true);
    baseUrl = `http://127.0.0.1:${port}`;
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/v1/health mengembalikan success envelope sesuai kontrak §2.1', async () => {
    const res = await fetch(`${baseUrl}/api/v1/health`);
    expect(res.status).toBe(200);
    expect(res.headers.get('x-trace-id')).toMatch(UUID_PATTERN);

    const body = (await res.json()) as {
      data: { status: string; service: string };
      meta: { trace_id: string };
      links: { self: string };
    };

    expect(body.data).toEqual({ status: 'ok', service: 'dashboard-divisi-api' });
    expect(body.meta.trace_id).toMatch(UUID_PATTERN);
    expect(body.links.self).toBe('/api/v1/health');
  });

  it('header x-trace-id sama dengan meta.trace_id', async () => {
    const res = await fetch(`${baseUrl}/api/v1/health`);
    const body = (await res.json()) as { meta: { trace_id: string } };

    expect(res.headers.get('x-trace-id')).toBe(body.meta.trace_id);
  });

  it('route tidak dikenal menghasilkan error envelope RESOURCE_NOT_FOUND', async () => {
    const res = await fetch(`${baseUrl}/api/v1/pasti-tidak-ada`);
    expect(res.status).toBe(404);

    const body = (await res.json()) as {
      error: { code: string; message: string; trace_id: string };
    };

    expect(Object.keys(body.error).sort()).toEqual([
      'code',
      'message',
      'trace_id',
    ]);
    expect(body.error.code).toBe('RESOURCE_NOT_FOUND');
    expect(typeof body.error.message).toBe('string');
    expect(body.error.message).not.toContain('\n');
    expect(body.error.trace_id).toMatch(UUID_PATTERN);
  });

  it('error tak terduga menjadi INTERNAL_ERROR generik tanpa bocor detail internal', async () => {
    const res = await fetch(`${baseUrl}/api/v1/boom`);
    expect(res.status).toBe(500);

    const body = (await res.json()) as {
      error: { code: string; message: string; trace_id: string };
    };

    expect(body.error.code).toBe('INTERNAL_ERROR');
    expect(body.error.message).not.toContain(SECRET_MARKER);
    expect(JSON.stringify(body)).not.toContain(SECRET_MARKER);
    expect(body.error.trace_id).toMatch(UUID_PATTERN);
  });
});
