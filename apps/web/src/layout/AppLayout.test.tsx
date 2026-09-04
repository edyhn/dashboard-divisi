import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { SessionProvider } from '../session/SessionContext';
import { AuthProvider } from '../session/AuthContext';
import { AppLayout } from './AppLayout';

describe('ORG-06 Menu per capability', () => {
  afterEach(() => {
    localStorage.clear();
    cleanup();
  });

  it('ADMIN melihat menu omzet dan target, tapi tidak penilaian', () => {
    localStorage.setItem('dashboard-divisi.role-demo', 'ADMIN');
    localStorage.setItem('dashboard-divisi.division-demo', 'WRAP');

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <AuthProvider>
          <SessionProvider>
            <Routes>
              <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<div>child</div>} />
              </Route>
            </Routes>
          </SessionProvider>
        </AuthProvider>
      </MemoryRouter>,
    );

    expect(screen.getAllByText('Report Harian').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Rincian Omset Tenant').length).toBeGreaterThan(0);
  });

  it('BOD melihat laporan', () => {
    localStorage.setItem('dashboard-divisi.role-demo', 'BOD');

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <AuthProvider>
          <SessionProvider>
            <Routes>
              <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<div>child</div>} />
              </Route>
            </Routes>
          </SessionProvider>
        </AuthProvider>
      </MemoryRouter>,
    );

    expect(screen.getAllByText('Detail Laporan').length).toBeGreaterThan(0);
  });
});
