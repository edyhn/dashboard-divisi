/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it } from 'vitest';
import { OrgReadModelService } from './org-read-model.service';
import type { JwtPayload } from '../auth/jwt-auth.guard';

describe('ORG-04 Endpoint/read model — FE filter sesuai scope server', () => {
  const mockPrismaEmpty = {
    division: {
      findMany: async () => [],
      findUnique: async ({ where }: any) => ({ id: `id-${where.code}`, code: where.code, name: 'Test Division' }),
    },
    outlet: { findMany: async () => [], findUnique: async () => null },
    employeeAssignment: { findMany: async () => [] },
  } as any;

  const bod: JwtPayload = { sub: 'bod1', email: 'bod1@x.test', role: 'BOD', divisionCode: null } as any;
  const mgrWrap: JwtPayload = { sub: 'mgr', email: 'mgr.wrap@x.test', role: 'MANAGER', divisionCode: 'WRAP' } as any;
  const admCell: JwtPayload = { sub: 'adm', email: 'adm.cell@x.test', role: 'ADMIN', divisionCode: 'CELL' } as any;

  it('BOD mendapat 7 divisi', async () => {
    const service = new OrgReadModelService(mockPrismaEmpty);
    const divs = await service.getDivisionsForUser(bod);
    expect(divs.length).toBe(7);
    expect(divs.map((d: any) => d.code)).toEqual(['WRAP', 'CELL', 'REFL', 'MINI', 'FNB', 'FIN', 'MC']);
  });

  it('Manager WRAP hanya dapat WRAP', async () => {
    const service = new OrgReadModelService(mockPrismaEmpty);
    const divs = await service.getDivisionsForUser(mgrWrap);
    expect(divs.length).toBe(1);
    expect(divs[0].code).toBe('WRAP');
  });

  it('Admin CELL hanya dapat CELL', async () => {
    const service = new OrgReadModelService(mockPrismaEmpty);
    const divs = await service.getDivisionsForUser(admCell);
    expect(divs.length).toBe(1);
    expect(divs[0].code).toBe('CELL');
  });

  it('Outlets: BOD dapat semua, Manager hanya own', async () => {
    const service = new OrgReadModelService(mockPrismaEmpty);
    const bodOutlets = await service.getOutletsForUser(bod);
    expect(bodOutlets.length).toBe(7);
    const mgrOutlets = await service.getOutletsForUser(mgrWrap);
    expect(mgrOutlets.length).toBe(1);
    expect((mgrOutlets[0] as any).divisionCode).toBe('WRAP');
  });

  it('Outlets dengan filter divisionCode: Manager tidak bisa akses divisi lain', async () => {
    const service = new OrgReadModelService(mockPrismaEmpty);
    const outlets = await service.getOutletsForUser(mgrWrap, 'CELL');
    expect(outlets.length).toBe(0); // ditolak karena scope
    const ok = await service.getOutletsForUser(mgrWrap, 'WRAP');
    expect(ok.length).toBe(1);
  });

  it('User context: scope, divisions, outlets sesuai role', async () => {
    const service = new OrgReadModelService(mockPrismaEmpty);
    const bodCtx = await service.getUserContext(bod);
    expect(bodCtx.scope).toBe('ALL_7_DIVISI');
    expect(bodCtx.divisions.length).toBe(7);

    const mgrCtx = await service.getUserContext(mgrWrap);
    expect(mgrCtx.scope).toBe('WRAP');
    expect(mgrCtx.divisions.length).toBe(1);
    expect(mgrCtx.divisions[0]!.code).toBe('WRAP');
  });
});
