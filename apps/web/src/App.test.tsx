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
    expect(screen.getByRole('heading', { name: 'Ringkasan performa operasional' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Kesehatan data' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Drill-down action' })).toBeTruthy();
  });

  it('route guard memblokir admin ke halaman penilaian', () => {
    localStorage.setItem('dashboard-divisi.role-demo', 'ADMIN');
    localStorage.setItem('dashboard-divisi.division-demo', 'WRAP');
    window.history.pushState({}, '', '/penilaian');

    render(<App />);
    expect(screen.getByTestId('no-access')).toBeTruthy();
  });

  it('menampilkan approval dan governance penilaian untuk BOD', () => {
    localStorage.setItem('dashboard-divisi.role-demo', 'BOD');
    window.history.pushState({}, '', '/penilaian');

    render(<App />);
    expect(screen.getByRole('heading', { name: 'Penilaian Performa' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'BOD approval assessment' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Governance penilaian' })).toBeTruthy();
    expect(screen.getByText('Weighted score server-side')).toBeTruthy();
  });

  it('menampilkan target approval governance untuk BOD', () => {
    localStorage.setItem('dashboard-divisi.role-demo', 'BOD');
    window.history.pushState({}, '', '/target');

    render(<App />);
    expect(screen.getByRole('heading', { name: 'Target & Realisasi' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'BOD review detail' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Governance target' })).toBeTruthy();
    expect(screen.getByText('Segregation of duties')).toBeTruthy();
  });

  it('route guard mengizinkan admin ke halaman omzet', () => {
    localStorage.setItem('dashboard-divisi.role-demo', 'ADMIN');
    localStorage.setItem('dashboard-divisi.division-demo', 'WRAP');
    window.history.pushState({}, '', '/omzet');

    render(<App />);
    expect(screen.getByRole('heading', { name: 'Data Omzet' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Rekonsiliasi daily vs monthly' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Correction workflow' })).toBeTruthy();
  });

  it('menampilkan workforce overview mock SobatHR', () => {
    localStorage.setItem('dashboard-divisi.role-demo', 'HRD');
    window.history.pushState({}, '', '/workforce');

    render(<App />);
    expect(screen.getByRole('heading', { name: 'Kehadiran, Cuti, Lembur' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Import SobatHR' })).toBeTruthy();
    expect(screen.getByText('Payroll')).toBeTruthy();
    expect(screen.getByText('Privacy guard')).toBeTruthy();
  });

  it('menampilkan data karyawan dan resolusi mapping HRD', () => {
    localStorage.setItem('dashboard-divisi.role-demo', 'HRD');
    window.history.pushState({}, '', '/karyawan');

    render(<App />);
    expect(screen.getByRole('heading', { name: 'Data Karyawan' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Assignment historis' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Resolusi UNMAPPED' })).toBeTruthy();
    expect(screen.getByText('Payroll detail tidak tampil')).toBeTruthy();
  });

  it('menampilkan reporting center dan guardrail export BOD', () => {
    localStorage.setItem('dashboard-divisi.role-demo', 'BOD');
    window.history.pushState({}, '', '/laporan');

    render(<App />);
    expect(screen.getByRole('heading', { name: 'Laporan & Export' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Katalog laporan' })).toBeTruthy();
    expect(screen.getAllByText('Payroll Summary')).toHaveLength(2);
    expect(screen.getByRole('heading', { name: 'Access guardrail' })).toBeTruthy();
  });

  it('menampilkan konfigurasi divisi outlet untuk superadmin', () => {
    localStorage.setItem('dashboard-divisi.role-demo', 'SUPERADMIN');
    window.history.pushState({}, '', '/konfigurasi');

    render(<App />);
    expect(screen.getByRole('heading', { name: 'Konfigurasi Divisi & Outlet' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Divisi' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Outlet' })).toBeTruthy();
    expect(screen.getByText('Money Changer guard')).toBeTruthy();
  });

  it('menampilkan profil self-view untuk user', () => {
    localStorage.setItem('dashboard-divisi.role-demo', 'USER');
    window.history.pushState({}, '', '/profil');

    render(<App />);
    expect(screen.getByRole('heading', { name: 'Profil Saya' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Self-service pribadi' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Privacy guard' })).toBeTruthy();
    expect(screen.getByText('Tanpa nominal payroll')).toBeTruthy();
  });
});
