import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SessionProvider } from '../session/SessionContext';
import { RouteGuard } from './RouteGuard';
import { hasCapability, canAccessDivision } from '../session/capability';
import type { Role } from '../mocks/session';

import { AuthProvider } from '../session/AuthContext';

describe('ORG-06 RouteGuard per capability & division — 7 divisi', () => {
  it('hasCapability: BOD all, Manager limited', () => {
    expect(hasCapability('BOD', 'view:division')).toBe(true);
    expect(hasCapability('BOD', 'random:cap')).toBe(true);
    expect(hasCapability('MANAGER', 'view:division')).toBe(true);
    expect(hasCapability('MANAGER', 'write:revenue')).toBe(true); // Data Dictionary v0.2 §1.2
    expect(hasCapability('ADMIN', 'write:revenue')).toBe(true);
    expect(hasCapability('ADMIN', 'manage:division')).toBe(false);
  });

  it('canAccessDivision: BOD all 7, Manager strict 1:1', () => {
    const bod = { role: 'BOD' as Role, divisionCode: null };
    for (const code of ['WRAP', 'CELL', 'REFL', 'MINI', 'FNB', 'FIN', 'MC']) {
      expect(canAccessDivision(bod, code)).toBe(true);
    }
    const mgrWrap = { role: 'MANAGER' as Role, divisionCode: 'WRAP' };
    expect(canAccessDivision(mgrWrap, 'WRAP')).toBe(true);
    expect(canAccessDivision(mgrWrap, 'CELL')).toBe(false);
    expect(canAccessDivision(mgrWrap, null)).toBe(true); // no filter
  });

  it('RouteGuard blocks jika capability tidak ada', async () => {
    // Mock session dengan ADMIN (tidak punya manage:division)
    localStorage.setItem('dashboard-divisi.role-demo', 'ADMIN');
    localStorage.removeItem('dashboard-divisi.division-demo');
    render(
      <MemoryRouter>
        <AuthProvider>
          <SessionProvider>
            <RouteGuard capability="manage:division" fallback={<div data-testid="blocked">blocked</div>}>
              <div data-testid="ok">ok</div>
            </RouteGuard>
          </SessionProvider>
        </AuthProvider>
      </MemoryRouter>,
    );
    expect(screen.getByTestId('blocked')).toBeDefined();
    expect(screen.queryByTestId('ok')).toBeNull();
    localStorage.clear();
  });

  it('RouteGuard blocks jika division tidak sesuai', async () => {
    localStorage.setItem('dashboard-divisi.role-demo', 'MANAGER');
    localStorage.setItem('dashboard-divisi.division-demo', 'WRAP');
    render(
      <MemoryRouter>
        <AuthProvider>
          <SessionProvider>
            <RouteGuard divisionCode="CELL" fallback={<div data-testid="blocked">blocked</div>}>
              <div data-testid="ok">ok</div>
            </RouteGuard>
          </SessionProvider>
        </AuthProvider>
      </MemoryRouter>,
    );
    expect(screen.getByTestId('blocked')).toBeDefined();
    localStorage.clear();
  });

  it('RouteGuard allows jika capability & division sesuai', async () => {
    localStorage.setItem('dashboard-divisi.role-demo', 'BOD');
    render(
      <MemoryRouter>
        <AuthProvider>
          <SessionProvider>
            <RouteGuard capability="view:division" divisionCode="WRAP">
              <div data-testid="ok">ok</div>
            </RouteGuard>
          </SessionProvider>
        </AuthProvider>
      </MemoryRouter>,
    );
    expect(screen.getByTestId('ok')).toBeDefined();
    localStorage.clear();
  });
});
