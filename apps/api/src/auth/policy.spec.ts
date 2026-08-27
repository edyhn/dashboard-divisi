/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it } from 'vitest';
import { PolicyService } from './policy.service';
import { ApiError } from '../common/api-error';
import type { JwtPayload } from './jwt-auth.guard';

const BOD: JwtPayload = { sub: 'bod1', email: 'bod1@dashboard.test', role: 'BOD', divisionCode: null } as any;
const MGR_WRAP: JwtPayload = { sub: 'm1', email: 'manager.wrap@dashboard.test', role: 'MANAGER', divisionCode: 'WRAP' } as any;
const ADM_WRAP: JwtPayload = { sub: 'a1', email: 'admin.wrap@dashboard.test', role: 'ADMIN', divisionCode: 'WRAP' } as any;
const MGR_CELL: JwtPayload = { sub: 'm2', email: 'manager.cell@dashboard.test', role: 'MANAGER', divisionCode: 'CELL' } as any;

const CODES = ['WRAP', 'CELL', 'REFL', 'MINI', 'FNB', 'FIN', 'MC'];

describe('PolicyService — 7 divisi 17 akun scope (FND-07)', () => {
  const policy = new PolicyService();

  it('BOD lintas 7 divisi: canAccessDivision true untuk semua', () => {
    for (const code of CODES) {
      expect(policy.canAccessDivision(BOD, code)).toBe(true);
    }
  });

  it('Manager WRAP hanya bisa WRAP, tidak untuk divisi lain', () => {
    expect(policy.canAccessDivision(MGR_WRAP, 'WRAP')).toBe(true);
    expect(policy.canAccessDivision(MGR_WRAP, 'CELL')).toBe(false);
    expect(policy.canAccessDivision(MGR_WRAP, 'MC')).toBe(false);
  });

  it('Admin WRAP strict 1:1', () => {
    expect(policy.canAccessDivision(ADM_WRAP, 'WRAP')).toBe(true);
    expect(policy.canAccessDivision(ADM_WRAP, 'FIN')).toBe(false);
  });

  it('Manager CELL tidak bisa akses WRAP', () => {
    expect(policy.canAccessDivision(MGR_CELL, 'WRAP')).toBe(false);
    expect(policy.canAccessDivision(MGR_CELL, 'CELL')).toBe(true);
  });

  it('assertDivisionScope melempar SCOPE_VIOLATION jika salah divisi', () => {
    try {
      policy.assertDivisionScope(MGR_WRAP, 'CELL');
      expect.unreachable('should throw');
    } catch (e) {
      expect((e as ApiError).code).toBe('SCOPE_VIOLATION');
    }
    expect(() => policy.assertDivisionScope(BOD, 'CELL')).not.toThrow();
  });

  it('BOD hasCapability * (all)', () => {
    expect(policy.hasCapability(BOD, 'view:division')).toBe(true);
    expect(policy.hasCapability(BOD, 'random:cap')).toBe(true);
  });

  it('Manager dan Admin capability sesuai map', () => {
    expect(policy.hasCapability(MGR_WRAP, 'view:division')).toBe(true);
    expect(policy.hasCapability(MGR_WRAP, 'write:revenue')).toBe(false); // admin only
    expect(policy.hasCapability(ADM_WRAP, 'write:revenue')).toBe(true);
    expect(policy.hasCapability(ADM_WRAP, 'manage:division')).toBe(false);
  });

  it('assertCapability melempar FORBIDDEN_CAPABILITY jika tidak punya', () => {
    try {
      policy.assertCapability(ADM_WRAP, 'manage:division');
      expect.unreachable('should throw');
    } catch (e) {
      expect((e as ApiError).code).toBe('FORBIDDEN_CAPABILITY');
    }
    expect(() => policy.assertCapability(BOD, 'manage:division')).not.toThrow();
  });

  it('canAccessDivision true jika tidak ada filter divisi', () => {
    expect(policy.canAccessDivision(MGR_WRAP, null)).toBe(true);
    expect(policy.canAccessDivision(MGR_WRAP, undefined)).toBe(true);
  });
});
