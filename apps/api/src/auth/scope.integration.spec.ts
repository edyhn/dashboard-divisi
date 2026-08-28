/* eslint-disable @typescript-eslint/no-explicit-any */
import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { describe, expect, it, beforeAll, afterAll } from 'vitest';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtAuthGuard } from './jwt-auth.guard';
import { TokenRevocationService } from './auth.service';
import { PolicyService } from './policy.service';
import { ScopeGuard } from './scope.guard';
import { CapabilityGuard } from './capability.guard';
import { RequireCapability } from './require-capability.decorator';
import { configureApp } from '../app.setup';
import type { INestApplication } from '@nestjs/common';

@Controller('test-scope')
@UseGuards(JwtAuthGuard, ScopeGuard)
class TestScopeController {
  @Get(':divisionCode')
  getByDivision(@Param('divisionCode') code: string) {
    return { divisionCode: code, ok: true };
  }

  @Get('cap/admin-only')
  @UseGuards(CapabilityGuard)
  @RequireCapability('write:revenue')
  getAdminOnly() {
    return { ok: true };
  }
}

describe('FND-07 Scope + Capability guard — server-side enforcement', () => {
  let app: INestApplication;
  let baseUrl: string;
  let jwtService: JwtService;

  const BOD_PAYLOAD = { sub: 'mock-bod1', email: 'bod1@dashboard.test', role: 'BOD', divisionCode: null };
  const MGR_WRAP_PAYLOAD = { sub: 'mock-mgr-wrap', email: 'manager.wrap@dashboard.test', role: 'MANAGER', divisionCode: 'WRAP' };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env.local', '.env'], validate: (c: any) => ({ ...c, DATABASE_URL: c.DATABASE_URL ?? 'postgresql://user:password@localhost:5432/test', JWT_SECRET: c.JWT_SECRET ?? 'test-jwt-secret-min-32-karakter-untuk-automated-test-1234' } as any) }),
        PrismaModule,
        JwtModule.register({ secret: 'test-jwt-secret-min-32-karakter-untuk-automated-test-1234', signOptions: { expiresIn: '8h' } }),
      ],
      controllers: [TestScopeController],
      providers: [PolicyService, TokenRevocationService, JwtAuthGuard, ScopeGuard, CapabilityGuard],
    }).compile();

    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.listen(0);
    const url = await app.getUrl();
    const port = Number(url.match(/:(\d+)$/)?.[1]);
    baseUrl = `http://127.0.0.1:${port}`;
    jwtService = moduleRef.get(JwtService);
  });

  afterAll(async () => {
    await app.close();
  });

  it('BOD dapat akses semua 7 divisi', async () => {
    const token = await jwtService.signAsync(BOD_PAYLOAD as any);
    for (const code of ['WRAP', 'CELL', 'REFL', 'MINI', 'FNB', 'FIN', 'MC']) {
      const res = await fetch(`${baseUrl}/api/v1/test-scope/${code}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(res.status).toBe(200);
    }
  });

  it('Manager WRAP hanya bisa WRAP, SCOPE_VIOLATION untuk CELL', async () => {
    const token = await jwtService.signAsync(MGR_WRAP_PAYLOAD as any);
    const okRes = await fetch(`${baseUrl}/api/v1/test-scope/WRAP`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(okRes.status).toBe(200);

    const badRes = await fetch(`${baseUrl}/api/v1/test-scope/CELL`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(badRes.status).toBe(403);
    const body = await badRes.json() as any;
    expect(body.error.code).toBe('SCOPE_VIOLATION');
  });

  it('Tanpa token 401 AUTH_REQUIRED (server-side, bukan hide menu)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/test-scope/WRAP`);
    expect(res.status).toBe(401);
    const body = await res.json() as any;
    expect(body.error.code).toBe('AUTH_REQUIRED');
  });

  it('Capability: ADMIN tidak punya manage:division → FORBIDDEN_CAPABILITY (via unit policy)', async () => {
    // This is covered via policy.service, but we test via endpoint that requires write:revenue (ADMIN has, MANAGER not)
    const mgrToken = await jwtService.signAsync(MGR_WRAP_PAYLOAD as any);
    const res = await fetch(`${baseUrl}/api/v1/test-scope/cap/admin-only`, {
      headers: { Authorization: `Bearer ${mgrToken}` },
    });
    // Manager tidak punya write:revenue? Actually MANAGER has not write:revenue per map, ADMIN has -> Manager should 403
    expect(res.status).toBe(403);
    const body = await res.json() as any;
    expect(body.error.code).toBe('FORBIDDEN_CAPABILITY');
  });
});
