import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import App from './App';

describe('App', () => {
  afterEach(() => {
    localStorage.clear();
    cleanup();
    window.history.pushState({}, '', '/');
  });

  it('merender halaman ringkasan pada route root', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: 'Ringkasan' })).toBeTruthy();
  });

  it('route guard memblokir admin ke halaman penilaian', () => {
    localStorage.setItem('dashboard-divisi.role-demo', 'ADMIN');
    localStorage.setItem('dashboard-divisi.division-demo', 'WRAP');
    window.history.pushState({}, '', '/penilaian');

    render(<App />);
    expect(screen.getByTestId('no-access')).toBeTruthy();
  });

  it('route guard mengizinkan admin ke halaman omzet', () => {
    localStorage.setItem('dashboard-divisi.role-demo', 'ADMIN');
    localStorage.setItem('dashboard-divisi.division-demo', 'WRAP');
    window.history.pushState({}, '', '/omzet');

    render(<App />);
    expect(screen.getByRole('heading', { name: 'Data Omzet' })).toBeTruthy();
  });
});
