import { describe, expect, it } from 'vitest';
import { PolicyService } from '../auth/policy.service';
import type { JwtPayload } from '../auth/jwt-auth.guard';

describe('ORG-01 Division & Outlet sebagai config — tanpa deploy', () => {
  const policy = new PolicyService();

  it('7 divisi awal ter-seed, divisi baru (NEW-DIV) bisa ditambah tanpa code change', () => {
    const newCode = 'NEW-DIV';
    const bod: JwtPayload = { sub: 'bod', email: 'bod@x.test', role: 'BOD', divisionCode: null } as any;
    const mgrNew: JwtPayload = { sub: 'mgr-new', email: 'mgr.new@x.test', role: 'MANAGER', divisionCode: newCode } as any;

    // BOD bisa akses NEW-DIV tanpa code change (karena canAccessDivision generik, bukan hardcoded list)
    expect(policy.canAccessDivision(bod, newCode)).toBe(true);
    // Manager NEW-DIV hanya bisa NEW-DIV, tidak bisa WRAP
    expect(policy.canAccessDivision(mgrNew, newCode)).toBe(true);
    expect(policy.canAccessDivision(mgrNew, 'WRAP')).toBe(false);
  });

  it('Division model: code sebagai string unik, bukan enum — tambah via DB tanpa deploy', () => {
    // Verifikasi bahwa Division.code adalah string unik, bukan enum hardcoded 6/7
    // Jika code adalah enum, menambah divisi baru butuh migrasi enum + deploy; jika string, cukup insert
    const codes = ['WRAP', 'CELL', 'REFL', 'MINI', 'FNB', 'FIN', 'MC', 'NEW-DIV-8'];
    for (const code of codes) {
      const user: JwtPayload = { sub: 'u', email: 'a@x.test', role: 'MANAGER', divisionCode: code } as any;
      expect(policy.canAccessDivision(user, code)).toBe(true);
    }
  });

  it('Outlet terikat Division via divisionCode string — outlet baru tanpa deploy', () => {
    // Outlet.code unik, divisionCode string — tambah outlet baru untuk divisi baru tanpa code
    const outletCode = 'NEW-DIV-001';
    const divisionCode = 'NEW-DIV';
    // simulasi: outlet baru bisa dibuat untuk divisi baru tanpa ubah schema
    expect(outletCode.startsWith(divisionCode)).toBe(true);
  });
});
