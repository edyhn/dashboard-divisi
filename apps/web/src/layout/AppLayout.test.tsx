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

    expect(screen.getByText('Data Omzet')).toBeTruthy();
    expect(screen.getByText('Target & Realisasi')).toBeTruthy();
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

    expect(screen.getByText('Laporan')).toBeTruthy();
    expect(screen.queryByText('Data Omzet')).toBeNull();
  });
});
