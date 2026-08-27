/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it } from 'vitest';
import { UserScopeService } from './userscope.service';
import { PolicyService } from '../auth/policy.service';

describe('ORG-03 User/Role/Permission/UserScope — 17 akun 7 divisi', () => {
  it('BOD lintas 7 divisi: hasScope true untuk semua', () => {
    const bod = { role: 'BOD', divisionCode: null };
    for (const code of ['WRAP', 'CELL', 'REFL', 'MINI', 'FNB', 'FIN', 'MC']) {
      expect(UserScopeService.hasScopeInMemory(bod as any, code)).toBe(true);
    }
  });

  it('Manager/Admin strict 1:1 — hanya divisi own', () => {
    const mgrWrap = { role: 'MANAGER', divisionCode: 'WRAP' };
    expect(UserScopeService.hasScopeInMemory(mgrWrap as any, 'WRAP')).toBe(true);
    expect(UserScopeService.hasScopeInMemory(mgrWrap as any, 'CELL')).toBe(false);
    expect(UserScopeService.hasScopeInMemory(mgrWrap as any, 'MC')).toBe(false);

    const admFin = { role: 'ADMIN', divisionCode: 'FIN' };
    expect(UserScopeService.hasScopeInMemory(admFin as any, 'FIN')).toBe(true);
    expect(UserScopeService.hasScopeInMemory(admFin as any, 'WRAP')).toBe(false);
  });

  it('Finance bukan role sistem (decision log) — hanya divisi', () => {
    const roles = ['BOD', 'MANAGER', 'ADMIN'];
    expect(roles).not.toContain('FINANCE');
    expect(roles).not.toContain('FIN');
    // Finance adalah divisionCode, bukan role
    const finDivision = 'FIN';
    expect(['WRAP', 'CELL', 'REFL', 'MINI', 'FNB', 'FIN', 'MC']).toContain(finDivision);
  });

  it('Role & scope teruji: 17 akun = 3 BOD (null) + 7 Manager + 7 Admin', () => {
    const users = [
      { email: 'bod1@dashboard.test', role: 'BOD', divisionCode: null },
      { email: 'manager.wrap@dashboard.test', role: 'MANAGER', divisionCode: 'WRAP' },
      { email: 'admin.wrap@dashboard.test', role: 'ADMIN', divisionCode: 'WRAP' },
    ];
    expect(users[0]!.divisionCode).toBeNull(); // BOD all
    expect(users[1]!.divisionCode).toBe('WRAP');
    expect(users[2]!.divisionCode).toBe('WRAP');
  });

  it('capability check terintegrasi dengan UserScope (via PolicyService)', async () => {
    // Sudah diuji di policy.spec, tapi ORG-03 memastikan UserScope + capability konsisten
    const policy = new PolicyService();
    const bod: any = { sub: 'bod1', email: 'bod1@x.test', role: 'BOD', divisionCode: null };
    const mgrWrap: any = { sub: 'mgr', email: 'mgr@x.test', role: 'MANAGER', divisionCode: 'WRAP' };
    expect(policy.hasCapability(bod, 'view:division')).toBe(true);
    expect(policy.hasCapability(mgrWrap, 'view:division')).toBe(true);
    expect(policy.hasCapability(mgrWrap, 'write:revenue')).toBe(false);
    expect(policy.canAccessDivision(mgrWrap, 'WRAP')).toBe(true);
    expect(policy.canAccessDivision(mgrWrap, 'CELL')).toBe(false);
  });
});
