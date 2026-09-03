import { useState } from 'react';
import { ChevronRight, Lock, Clock, CheckCircle2, Plus, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../session/AuthContext';
import { roleDisplay } from '../mocks/session';
import { Button } from '../components/ui/Button';

export default function DashboardPage() {
  const { user } = useAuth();
  const role = user?.role ?? 'USER';
  const isBod = role === 'BOD';
  const isManager = role === 'MANAGER' || role === 'SUPERADMIN';
  const isAdmin = role === 'ADMIN';
  const isPicViewOnly = role === 'PIC' || role === 'USER';

  const userDivision = user?.divisionCode;

  // State antrean ACC untuk Manager
  const [pendingApprovals, setPendingApprovals] = useState([
    { id: '1', division: 'WRAP', name: 'Wrapping', revenue: 45000000, date: '2026-09-03', admin: 'Admin Wrapping' },
    { id: '4', division: 'MINI', name: 'Minimarket', revenue: 65000000, date: '2026-09-03', admin: 'Admin Minimarket' },
    { id: '6', division: 'FIN', name: 'Finance', revenue: 150000000, date: '2026-09-03', admin: 'Admin Finance' },
  ]);

  const filteredPending = pendingApprovals.filter(a => {
    if (isBod || !userDivision) return true;
    return a.division === userDivision;
  });

  const handleQuickApprove = (id: string) => {
    setPendingApprovals(pendingApprovals.filter(a => a.id !== id));
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header Welcome Banner */}
      <section className="relative overflow-hidden rounded-card-lg border border-line/40 bg-gradient-to-r from-navy via-[#1e293b] to-navy p-6 text-white shadow-lg">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-pill bg-white/10 px-3 py-1 text-xs font-semibold text-primary-light backdrop-blur-md">
              <span> Dashboard Terpersonalisasi ({roleDisplay(role)})</span>
            </div>
            <h1 className="mt-2 text-2xl md:text-3xl font-extrabold tracking-tight">
              Selamat Datang, {user?.name ?? 'Pengguna'}
            </h1>
            <p className="mt-1 text-sm text-slate-300">
              Scope Operasional: <span className="font-semibold text-white">{user?.divisionCode ?? 'Semua Divisi (7 Divisi)'}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            {isBod && (
              <span className="inline-flex items-center gap-1.5 rounded-pill bg-primary/20 border border-primary/30 px-3.5 py-1.5 text-xs font-semibold text-primary-light">
                👔 Panel Executive BOD
              </span>
            )}
            {isManager && (
              <span className="inline-flex items-center gap-1.5 rounded-pill bg-success/20 border border-success/30 px-3.5 py-1.5 text-xs font-semibold text-success-light">
                ⚡ Panel Approval Manager
              </span>
            )}
            {isAdmin && (
              <span className="inline-flex items-center gap-1.5 rounded-pill bg-info/20 border border-info/30 px-3.5 py-1.5 text-xs font-semibold text-info-light">
                📝 Panel Input Admin Divisi
              </span>
            )}
            {isPicViewOnly && (
              <span className="inline-flex items-center gap-1.5 rounded-pill bg-warning/20 border border-warning/30 px-3.5 py-1.5 text-xs font-semibold text-warning-light">
                <Lock className="h-3.5 w-3.5" /> Panel Monitor PIC (View Only)
              </span>
            )}
          </div>
        </div>
      </section>

      {/* ==================== VIEW ROLE 1: EXECUTIVE (BOD) ==================== */}
      {isBod && (
        <div className="space-y-6">
          <div className="rounded-card-lg border border-line/40 bg-white/80 backdrop-blur-md p-6 shadow-sm">
            <h2 className="text-lg font-bold text-navy">Executive Performance Matrix (7 Divisi Konsolidasi)</h2>
            <p className="text-xs text-slate-500">Ringkasan hasil akhir yang telah disetujui (ACC) oleh Manager masing-masing divisi</p>

            <div className="mt-4 grid gap-4 md:grid-cols-4">
              <div className="rounded-card-lg border border-line/40 bg-primary/5 p-4">
                <p className="text-xs font-semibold uppercase text-slate-500">Total Omset Realisasi</p>
                <p className="mt-2 text-2xl font-black text-navy">Rp 2.462.500.000</p>
                <p className="mt-1 text-xs text-success font-bold">+14.8% vs Target Q3</p>
              </div>
              <div className="rounded-card-lg border border-line/40 bg-success/5 p-4">
                <p className="text-xs font-semibold uppercase text-slate-500">Net Profit Margin</p>
                <p className="mt-2 text-2xl font-black text-navy">49.0%</p>
                <p className="mt-1 text-xs text-success font-bold">Laba Bersih Rp 1.2M</p>
              </div>
              <div className="rounded-card-lg border border-line/40 bg-info/5 p-4">
                <p className="text-xs font-semibold uppercase text-slate-500">Tingkat ACC Manager</p>
                <p className="mt-2 text-2xl font-black text-navy">85.7%</p>
                <p className="mt-1 text-xs text-info font-bold">6 dari 7 Divisi Complete</p>
              </div>
              <div className="rounded-card-lg border border-line/40 bg-warning/5 p-4">
                <p className="text-xs font-semibold uppercase text-slate-500">Status Financial Health</p>
                <p className="mt-2 text-xl font-black text-success">Sangat Sehat</p>
                <p className="mt-1 text-xs text-slate-500">Zero Variance Audit</p>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <Link to="/laporan" className="rounded-input bg-navy px-4 py-2.5 text-xs font-bold text-white hover:bg-navy-light transition-colors">
                Buka Detail Laporan BOD
              </Link>
              <Link to="/pnl" className="rounded-input border border-line bg-white px-4 py-2.5 text-xs font-bold text-navy hover:bg-surface transition-colors">
                Tinjau Laporan PnL
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ==================== VIEW ROLE 2: MANAGER (SUPERADMIN) ==================== */}
      {isManager && (
        <div className="space-y-6">
          {/* Approval Queue Widget */}
          <section className="rounded-card-lg border border-warning/30 bg-gradient-to-br from-warning/10 to-white backdrop-blur-md p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-navy flex items-center gap-2">
                  <Clock className="h-5 w-5 text-warning" /> Manager Approval Center (Pending ACC)
                </h2>
                <p className="text-xs text-slate-500 mt-1">Crosscheck dan setujui laporan yang di-submit oleh Admin Divisi</p>
              </div>
              <span className="rounded-pill bg-warning px-3 py-1 text-xs font-bold text-white shadow-sm">
                {filteredPending.length} Perlu Verifikasi
              </span>
            </div>

            {filteredPending.length > 0 ? (
              <div className="mt-4 space-y-3">
                {filteredPending.map((item) => (
                  <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between rounded-card-lg border border-line/60 bg-white p-4 gap-3">
                    <div>
                      <span className="rounded-pill bg-navy/10 px-2.5 py-0.5 text-xs font-bold text-navy">{item.division} - {item.name}</span>
                      <p className="mt-1 text-sm font-bold text-navy">Omset Input: Rp {item.revenue.toLocaleString('id-ID')}</p>
                      <p className="text-xs text-slate-500">Disubmit oleh {item.admin} pada {item.date}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" onClick={() => handleQuickApprove(item.id)} className="bg-success hover:bg-success-dark text-white text-xs">
                        <Check className="mr-1 h-3.5 w-3.5" /> Setujui (ACC)
                      </Button>
                      <Link to="/laporan-harian">
                        <Button size="sm" variant="secondary" className="text-xs">Detail</Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-4 rounded-card-lg border border-success/20 bg-success-light/30 p-4 text-center">
                <CheckCircle2 className="mx-auto h-6 w-6 text-success" />
                <p className="mt-1 text-sm font-bold text-success">Semua Laporan Divisi Telah Di-ACC</p>
              </div>
            )}
          </section>

          {/* Shortcut Pengelolaan Manager */}
          <div className="grid gap-4 md:grid-cols-3">
            <Link to="/laporan-harian" className="rounded-card-lg border border-line p-5 bg-white shadow-sm hover:border-primary transition-all">
              <h3 className="font-bold text-navy">Report Harian & ACC</h3>
              <p className="text-xs text-slate-500 mt-1">Kelola verifikasi omset harian divisi</p>
            </Link>
            <Link to="/rincian-tenant" className="rounded-card-lg border border-line p-5 bg-white shadow-sm hover:border-primary transition-all">
              <h3 className="font-bold text-navy">Target Tenant</h3>
              <p className="text-xs text-slate-500 mt-1">Ubah target bulanan tenant/outlet</p>
            </Link>
            <Link to="/budgeting" className="rounded-card-lg border border-line p-5 bg-white shadow-sm hover:border-primary transition-all">
              <h3 className="font-bold text-navy">Format Budgeting</h3>
              <p className="text-xs text-slate-500 mt-1">Alokasi & pengawasan anggaran</p>
            </Link>
          </div>
        </div>
      )}

      {/* ==================== VIEW ROLE 3: ADMIN ==================== */}
      {isAdmin && (
        <div className="space-y-6">
          <section className="rounded-card-lg border border-primary/20 bg-gradient-to-br from-primary/5 to-white backdrop-blur-md p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-navy">Panel Input Admin Divisi</h2>
                <p className="text-xs text-slate-500 mt-1">Catat omset harian divisi Anda. Data akan terkirim ke Manager untuk di-ACC.</p>
              </div>
              <Link to="/laporan-harian">
                <Button className="bg-primary text-white text-xs">
                  <Plus className="mr-1.5 h-4 w-4" /> Input Omset Hari Ini
                </Button>
              </Link>
            </div>
          </section>

          <div className="grid gap-4 md:grid-cols-2">
            <Link to="/laporan-harian" className="rounded-card-lg border border-line p-5 bg-white shadow-sm hover:border-primary transition-all">
              <h3 className="font-bold text-navy">Log Input Omset Harian</h3>
              <p className="text-xs text-slate-500 mt-1">Pantau status laporan (Pending ACC / Approved)</p>
            </Link>
            <Link to="/rincian-tenant" className="rounded-card-lg border border-line p-5 bg-white shadow-sm hover:border-primary transition-all">
              <h3 className="font-bold text-navy">Data Tenant Outlet</h3>
              <p className="text-xs text-slate-500 mt-1">Lihat rincian pencapaian tenant divisi</p>
            </Link>
          </div>
        </div>
      )}

      {/* ==================== VIEW ROLE 4: PIC (VIEW ONLY) ==================== */}
      {isPicViewOnly && (
        <div className="space-y-6">
          <section className="rounded-card-lg border border-warning/30 bg-warning-light/30 p-4">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-warning" />
              <p className="text-xs font-semibold text-warning">
                Mode Akses PIC (Read-Only) — Pengisian data dilakukan oleh Admin Divisi dan di-ACC oleh Manager Divisi.
              </p>
            </div>
          </section>

          <div className="grid gap-4 md:grid-cols-2">
            <Link to="/laporan-harian" className="rounded-card-lg border border-line p-5 bg-white shadow-sm hover:border-primary transition-all">
              <h3 className="font-bold text-navy">Laporan Harian Divisi</h3>
              <p className="text-xs text-slate-500 mt-1">Lihat perkembangan omset harian divisi</p>
            </Link>
            <Link to="/rincian-tenant" className="rounded-card-lg border border-line p-5 bg-white shadow-sm hover:border-primary transition-all">
              <h3 className="font-bold text-navy">Rincian Tenant</h3>
              <p className="text-xs text-slate-500 mt-1">Lihat pencapaian omset per tenant</p>
            </Link>
          </div>
        </div>
      )}

      {/* Navigation Shortcut Cards untuk Semua Role */}
      <section className="rounded-card-lg border border-line/40 bg-white/80 backdrop-blur-md p-6 shadow-sm">
        <h2 className="text-base font-bold text-navy mb-4">Navigasi Cepat Modul Laporan</h2>
        <div className="grid gap-3 md:grid-cols-3">
          <Link to="/laporan-harian" className="rounded-card border border-line/60 p-3 bg-surface/30 hover:bg-white transition-colors flex items-center justify-between">
            <span className="text-xs font-bold text-navy">Report Harian</span>
            <ChevronRight className="h-4 w-4 text-slate-400" />
          </Link>
          <Link to="/rincian-tenant" className="rounded-card border border-line/60 p-3 bg-surface/30 hover:bg-white transition-colors flex items-center justify-between">
            <span className="text-xs font-bold text-navy">Rincian Omset Tenant</span>
            <ChevronRight className="h-4 w-4 text-slate-400" />
          </Link>
          <Link to="/laporan" className="rounded-card border border-line/60 p-3 bg-surface/30 hover:bg-white transition-colors flex items-center justify-between">
            <span className="text-xs font-bold text-navy">Detail Laporan</span>
            <ChevronRight className="h-4 w-4 text-slate-400" />
          </Link>
          <Link to="/budgeting" className="rounded-card border border-line/60 p-3 bg-surface/30 hover:bg-white transition-colors flex items-center justify-between">
            <span className="text-xs font-bold text-navy">Format Budgeting</span>
            <ChevronRight className="h-4 w-4 text-slate-400" />
          </Link>
          <Link to="/cashflow" className="rounded-card border border-line/60 p-3 bg-surface/30 hover:bg-white transition-colors flex items-center justify-between">
            <span className="text-xs font-bold text-navy">Cashflow</span>
            <ChevronRight className="h-4 w-4 text-slate-400" />
          </Link>
          <Link to="/pnl" className="rounded-card border border-line/60 p-3 bg-surface/30 hover:bg-white transition-colors flex items-center justify-between">
            <span className="text-xs font-bold text-navy">PNL (Profit & Loss)</span>
            <ChevronRight className="h-4 w-4 text-slate-400" />
          </Link>
        </div>
      </section>
    </div>
  );
}
