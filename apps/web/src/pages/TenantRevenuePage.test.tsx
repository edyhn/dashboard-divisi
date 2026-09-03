import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import TenantRevenuePage from './TenantRevenuePage';
import { AuthProvider } from '../session/AuthContext';
import { sobathrApi } from '../api/sobathr';

function renderWithProviders() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TenantRevenuePage />
      </AuthProvider>
    </QueryClientProvider>,
  );
}

describe('TenantRevenuePage - Integrasi Sobat API & Scoping', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('merender judul, kartu metrik, dan tenant terisolasi khusus divisi user (MANAGER WRAP)', async () => {
    localStorage.setItem('dashboard-divisi.role-demo', 'MANAGER');
    localStorage.setItem('dashboard-divisi.division-demo', 'WRAP');

    renderWithProviders();

    expect(screen.getByText('Rincian Omset Tenant')).toBeDefined();
    expect(screen.getByText(/Data Performa Outlet Tenant Khusus Divisi WRAP/i)).toBeDefined();

    // Pastikan tenant WRAP ada, sedangkan CELL tidak muncul
    expect(screen.getAllByText('Wrapping Master Outlet 1').length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByText('Cellular Flagship Store')).toBeNull();
  });

  it('BOD dapat melihat seluruh tenant dari 7 divisi', async () => {
    localStorage.setItem('dashboard-divisi.role-demo', 'BOD');
    localStorage.removeItem('dashboard-divisi.division-demo');

    renderWithProviders();

    expect(screen.getByText(/Analisis Kontribusi Omset Tenant 7 Divisi/i)).toBeDefined();
    expect(screen.getByText('Wrapping Master Outlet 1')).toBeDefined();
    expect(screen.getByText('Cellular Flagship Store')).toBeDefined();
    expect(screen.getByText('Refleksi Family Wellness')).toBeDefined();
  });

  it('menampilkan banner alert ketika Sobat API belum terkonfigurasi (UNCONFIGURED)', async () => {
    localStorage.setItem('dashboard-divisi.role-demo', 'MANAGER');
    localStorage.setItem('dashboard-divisi.division-demo', 'WRAP');

    vi.spyOn(sobathrApi, 'getStatus').mockResolvedValue({
      data: {
        provider: 'Sobat API',
        configured: false,
        status: 'UNCONFIGURED',
        base_url: null,
        has_api_key: false,
        has_company_id: false,
        last_sync: null,
        scheduler: 'MANUAL_ONLY',
      },
      meta: { trace_id: 'test-trace' },
      links: { self: '/api/v1/sobathr/status' },
    });

    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText(/Integrasi Sobat API belum dikonfigurasi/i)).toBeDefined();
    });
  });

  it('menonaktifkan tombol sync untuk peran view-only / USER tanpa capability write:revenue', async () => {
    localStorage.setItem('dashboard-divisi.role-demo', 'USER');
    localStorage.setItem('dashboard-divisi.division-demo', 'WRAP');

    renderWithProviders();

    const syncBtn = screen.getByRole('button', { name: /Tarik Data Tenant/i });
    expect(syncBtn).toBeDefined();
    expect(syncBtn).toBeDisabled();
    expect(screen.getByText(/Sync dinonaktifkan: akun view-only/i)).toBeDefined();
  });

  it('menjalankan proses sync sukses dan menampilkan toast notifikasi', async () => {
    localStorage.setItem('dashboard-divisi.role-demo', 'MANAGER');
    localStorage.setItem('dashboard-divisi.division-demo', 'WRAP');

    vi.spyOn(sobathrApi, 'syncTenants').mockResolvedValue({
      data: {
        provider: 'Sobat API',
        source: 'LIVE_SOBAT_API',
        division_code: 'WRAP',
        total_tenants: 1,
        synced_at: '2026-09-03T07:00:00Z',
        tenants: [
          {
            id: 'TNT-001',
            name: 'Wrapping Live Synced Outlet',
            division: 'WRAP',
            category: 'Wrapping',
            location: 'Lantai 1 - A01',
            monthlyRevenue: 150000000,
            monthlyTarget: 120000000,
            status: 'Over Target',
            growth: 25.0,
          },
        ],
      },
      meta: { trace_id: 'test-trace' },
      links: { self: '/api/v1/sobathr/sync-tenants' },
    });

    renderWithProviders();

    const syncBtn = screen.getByRole('button', { name: /Tarik Data Tenant/i });
    expect(syncBtn).toBeEnabled();

    fireEvent.click(syncBtn);

    await waitFor(() => {
      expect(screen.getByText(/Berhasil sinkronisasi 1 data tenant dari Sobat API/i)).toBeDefined();
      expect(screen.getAllByText('Wrapping Live Synced Outlet').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('menampilkan banner error fail-closed dengan tombol Coba Lagi saat sinkronisasi gagal', async () => {
    localStorage.setItem('dashboard-divisi.role-demo', 'MANAGER');
    localStorage.setItem('dashboard-divisi.division-demo', 'WRAP');

    vi.spyOn(sobathrApi, 'syncTenants').mockRejectedValue(
      new Error('Gagal berkomunikasi dengan upstream API Sobat (timeout).'),
    );

    renderWithProviders();

    const syncBtn = screen.getByRole('button', { name: /Tarik Data Tenant/i });
    fireEvent.click(syncBtn);

    await waitFor(() => {
      expect(screen.getByText(/Gagal Sinkronisasi: Gagal berkomunikasi dengan upstream/i)).toBeDefined();
      expect(screen.getByRole('button', { name: /Coba Lagi/i })).toBeDefined();
    });
  });
});
