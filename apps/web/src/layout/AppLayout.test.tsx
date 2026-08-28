import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { SessionProvider } from '../session/SessionContext';
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
        <SessionProvider>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<div>child</div>} />
            </Route>
          </Routes>
        </SessionProvider>
      </MemoryRouter>,
    );

    expect(screen.getAllByText('Data Omzet').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Target & Realisasi').length).toBeGreaterThan(0);
    expect(screen.queryByText('Penilaian Performa')).toBeNull();
  });

  it('BOD melihat laporan, tapi tidak data omzet', () => {
    localStorage.setItem('dashboard-divisi.role-demo', 'BOD');

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <SessionProvider>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<div>child</div>} />
            </Route>
          </Routes>
        </SessionProvider>
      </MemoryRouter>,
    );

    expect(screen.getAllByText('Laporan').length).toBeGreaterThan(0);
    expect(screen.queryByText('Data Omzet')).toBeNull();
  });

  it('menampilkan breadcrumb, scope, dan freshness shell', () => {
    localStorage.setItem('dashboard-divisi.role-demo', 'MANAGER');
    localStorage.setItem('dashboard-divisi.division-demo', 'WRAP');

    render(
      <MemoryRouter initialEntries={['/target']}>
        <SessionProvider>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/target" element={<div>child</div>} />
            </Route>
          </Routes>
        </SessionProvider>
      </MemoryRouter>,
    );

    expect(screen.getByText('Breadcrumb')).toBeTruthy();
    expect(screen.getAllByText('Target & Realisasi').length).toBeGreaterThan(0);
    expect(screen.getByText('MANAGER · WRAP')).toBeTruthy();
    expect(screen.getByText('Mock sinkron 10 menit lalu')).toBeTruthy();
  });
});
