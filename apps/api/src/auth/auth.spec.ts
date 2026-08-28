/* eslint-disable @typescript-eslint/no-explicit-any */
import { Test } from '@nestjs/testing';
import { describe, expect, it, beforeAll, afterAll } from 'vitest';
import { AppModule } from '../app.module';
import { configureApp } from '../app.setup';
import type { INestApplication } from '@nestjs/common';

describe('FND-06 Auth/session/logout — UAT-ACC-08', () => {
  let app: INestApplication;
  let baseUrl: string;
  let token: string;
  let cookie: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.listen(0);
    const url = await app.getUrl();
    const port = Number(url.match(/:(\d+)$/)?.[1]);
    baseUrl = `http://127.0.0.1:${port}`;
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /api/v1/auth/login dengan BOD berhasil', async () => {
    const res = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'bod1@dashboard.test', password: 'Password123!' }),
    });
    expect(res.status).toBe(200);
    const body = await res.json() as any;
    // envelope: data contains accessToken + user
    const data = body.data ?? body;
    expect(data.accessToken).toBeDefined();
    expect(data.user.email).toBe('bod1@dashboard.test');
    expect(data.user.role).toBe('BOD');
    token = data.accessToken;
    const setCookie = res.headers.get('set-cookie');
    expect(setCookie).toContain('access_token');
    // extract cookie for next requests
    cookie = setCookie?.split(';')[0] ?? '';
  });

  it('GET /api/v1/auth/me dengan token berhasil', async () => {
    const res = await fetch(`${baseUrl}/api/v1/auth/me`, {
      headers: { Authorization: `Bearer ${token}`, Cookie: cookie },
    });
    expect(res.status).toBe(200);
    const body = await res.json() as any;
    const data = body.data ?? body;
    expect(data.email).toBe('bod1@dashboard.test');
  });

  it('POST /api/v1/auth/logout lalu GET /me harus 401 (back-browser)', async () => {
    const logoutRes = await fetch(`${baseUrl}/api/v1/auth/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, Cookie: cookie },
    });
    expect(logoutRes.status).toBe(200);
    const replayRes = await fetch(`${baseUrl}/api/v1/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(replayRes.status).toBe(401);

    const meRes = await fetch(`${baseUrl}/api/v1/auth/me`, {
      headers: { Cookie: '' },
    });
    expect(meRes.status).toBe(401);
    const body = await meRes.json() as any;
    const err = body.error ?? body;
    expect(err.code).toBe('AUTH_REQUIRED');
  });

  it('login dengan password salah harus 401', async () => {
    const res = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'bod1@dashboard.test', password: 'salah' }),
    });
    expect(res.status).toBe(401);
  });

  it('Manager per divisi login dan divisionCode terisi', async () => {
    const res = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'manager.wrap@dashboard.test', password: 'Password123!' }),
    });
    expect(res.status).toBe(200);
    const body = await res.json() as any;
    const data = body.data ?? body;
    expect(data.user.role).toBe('MANAGER');
    expect(data.user.divisionCode).toBe('WRAP');
  });
});
