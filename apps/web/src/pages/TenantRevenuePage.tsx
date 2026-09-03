import { useState } from 'react';
import {
  Store,
  Search,
  Edit2,
  TrendingUp,
  Award,
  DollarSign,
  Download,
  ArrowUpRight,
  ShieldCheck,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  XCircle,
  Lock,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../session/AuthContext';
import { hasCapability } from '../session/capability';
import { useSobatStatus, useSobatSyncTenants } from '../hooks/useSobat';
import type { TenantRecordDto } from '../api/sobathr';

const INITIAL_TENANTS: TenantRecordDto[] = [
  { id: 'TNT-001', name: 'Wrapping Master Outlet 1', division: 'WRAP', category: 'Wrapping', location: 'Lantai 1 - A01', monthlyRevenue: 125000000, monthlyTarget: 100000000, status: 'Over Target', growth: +14.2 },
  { id: 'TNT-002', name: 'Cellular Flagship Store', division: 'CELL', category: 'Cellular', location: 'Lantai 1 - A05', monthlyRevenue: 310000000, monthlyTarget: 280000000, status: 'Over Target', growth: +11.1 },
  { id: 'TNT-003', name: 'Refleksi Family Wellness', division: 'REFL', category: 'Refleksi', location: 'Lantai 2 - B12', monthlyRevenue: 98000000, monthlyTarget: 95000000, status: 'On Track', growth: +5.1 },
  { id: 'TNT-004', name: 'Minimarket Serba Ada', division: 'MINI', category: 'Minimarket', location: 'Lantai 1 - A10', monthlyRevenue: 185000000, monthlyTarget: 190000000, status: 'Action Needed', growth: -2.4 },
  { id: 'TNT-005', name: 'FnB Resto Kuliner Nusantara', division: 'FNB', category: 'F&B', location: 'Lantai 2 - B01', monthlyRevenue: 250000000, monthlyTarget: 220000000, status: 'Over Target', growth: +15.9 },
  { id: 'TNT-006', name: 'Finance Service Counter', division: 'FIN', category: 'Finance', location: 'Lantai 3 - C01', monthlyRevenue: 480000000, monthlyTarget: 450000000, status: 'On Track', growth: +6.0 },
  { id: 'TNT-007', name: 'Money Changer Global Exchange', division: 'MC', category: 'Money Changer', location: 'Lantai 1 - A02', monthlyRevenue: 620000000, monthlyTarget: 600000000, status: 'Over Target', growth: +8.5 },
];

export default function TenantRevenuePage() {
  const { user } = useAuth();
  const isBod = user?.role === 'BOD';
  const canSync = hasCapability(user?.role as never, 'write:revenue');
  const isPicViewOnly = !canSync || user?.role === 'PIC' || user?.role === 'USER';
  const userDivision = user?.divisionCode;

  const [tenants, setTenants] = useState<TenantRecordDto[]>(INITIAL_TENANTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  // TanStack Query status & mutation hooks
  const { data: sobatStatus } = useSobatStatus();
  const syncMutation = useSobatSyncTenants();

  // Edit Target Modal State
  const [selectedTenant, setSelectedTenant] = useState<TenantRecordDto | null>(null);
  const [newTarget, setNewTarget] = useState<number>(0);

  // Filter Scoping Divisi (Manager/Admin/PIC hanya melihat divisinya sendiri)
  const scopedTenants = tenants.filter((t) => {
    if (isBod || !userDivision) return true;
    return t.division === userDivision;
  });

  const filteredTenants = scopedTenants.filter((t) => {
    return (
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.location.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const totalTenantRev = scopedTenants.reduce((acc, curr) => acc + curr.monthlyRevenue, 0);
  const avgRev = Math.round(totalTenantRev / Math.max(scopedTenants.length, 1));
  const topTenant = [...scopedTenants].sort((a, b) => b.monthlyRevenue - a.monthlyRevenue)[0];

  const handleSyncTenants = async () => {
    if (!canSync || syncMutation.isPending) return;
    setSyncError(null);
    try {
      const res = await syncMutation.mutateAsync(userDivision ?? undefined);
      if (res?.tenants && res.tenants.length > 0) {
        setTenants(res.tenants);
      }
      setToastMsg(`✅ Berhasil sinkronisasi ${res?.total_tenants ?? 0} data tenant dari Sobat API!`);
      setTimeout(() => setToastMsg(null), 4000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal menghubungi server untuk sinkronisasi Sobat API.';
      setSyncError(message);
    }
  };

  const handleSaveTarget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenant) return;

    setTenants(
      tenants.map((t) => {
        if (t.id === selectedTenant.id) {
          const pct = (t.monthlyRevenue / newTarget) * 100;
          const status = pct >= 110 ? 'Over Target' : pct >= 95 ? 'On Track' : 'Action Needed';
          return { ...t, monthlyTarget: newTarget, status };
        }
        return t;
      }),
    );
    setSelectedTenant(null);
  };

  const syncButtonTitle = !canSync
    ? 'Izin terbatas: Peran Anda tidak memiliki capability write:revenue'
    : sobatStatus && !sobatStatus.configured
      ? 'Sobat API belum dikonfigurasi di environment'
      : 'Tarik pembaruan data tenant dari Sobat API';

  return (
    <div className="space-y-6 animate-fade-in-up relative">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 rounded-card-lg bg-navy text-white px-4 py-3 shadow-2xl border border-primary/30 animate-fade-in-down text-xs font-semibold">
          <CheckCircle className="h-4 w-4 text-success" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header Banner */}
      <section className="relative overflow-hidden rounded-card-lg border border-line/40 bg-gradient-to-r from-navy via-[#1e293b] to-navy p-6 text-white shadow-lg">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-pill bg-white/10 px-3 py-1 text-xs font-semibold text-info-light backdrop-blur-md">
              <Store className="h-3.5 w-3.5" /> Scope Terisolasi: {userDivision ? `Divisi ${userDivision}` : 'Lintas 7 Divisi (BOD)'}
            </div>
            <h1 className="mt-2 text-2xl md:text-3xl font-extrabold tracking-tight">Rincian Omset Tenant</h1>
            <p className="mt-1 text-sm text-slate-300">
              {isBod ? 'Analisis Kontribusi Omset Tenant 7 Divisi' : `Data Performa Outlet Tenant Khusus Divisi ${userDivision}`}
            </p>
          </div>
          <div className="flex flex-col items-start md:items-end gap-2">
            <div className="flex flex-wrap items-center gap-3">
              <Button
                onClick={handleSyncTenants}
                disabled={syncMutation.isPending || !canSync}
                title={syncButtonTitle}
                className={`text-xs shadow-md ${
                  !canSync
                    ? 'bg-slate-600 text-slate-300 cursor-not-allowed opacity-60'
                    : 'bg-success hover:bg-success-dark text-white'
                }`}
              >
                <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
                {syncMutation.isPending ? 'Memproses Sync...' : '⚡ Tarik Data Tenant (Sobat API)'}
              </Button>
              <Button variant="secondary" className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs">
                <Download className="mr-1.5 h-3.5 w-3.5" /> Download Laporan Tenant
              </Button>
            </div>
            {!canSync && (
              <div className="flex items-center gap-1 text-[11px] text-amber-300 font-medium">
                <Lock className="h-3 w-3" />
                <span>Sync dinonaktifkan: akun view-only (tanpa izin write:revenue)</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Unconfigured Alert Banner */}
      {sobatStatus && !sobatStatus.configured && (
        <section className="rounded-card-lg border border-amber-300/40 bg-amber-50 p-3.5 flex items-center justify-between text-xs text-amber-900 font-medium animate-fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
            <span>Integrasi Sobat API belum dikonfigurasi (status: <strong>UNCONFIGURED</strong>). Endpoint upstream siap menerima konfigurasi environment aman.</span>
          </div>
          <span className="rounded-pill bg-amber-200 px-2.5 py-0.5 text-amber-800 font-mono text-[11px]">Unconfigured</span>
        </section>
      )}

      {/* Sync Error with Retry Banner */}
      {syncError && (
        <section className="rounded-card-lg border border-danger/30 bg-danger-light/60 p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs text-danger font-semibold animate-fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-danger" />
            <span>Gagal Sinkronisasi: {syncError}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {canSync && (
              <Button
                size="sm"
                onClick={handleSyncTenants}
                disabled={syncMutation.isPending}
                className="bg-danger hover:bg-danger-dark text-white text-xs px-3 py-1 border-none shadow-sm"
              >
                <RefreshCw className={`mr-1 h-3 w-3 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
                Coba Lagi
              </Button>
            )}
            <button
              onClick={() => setSyncError(null)}
              className="text-slate-400 hover:text-slate-600 p-1"
              title="Tutup pemberitahuan error"
            >
              <XCircle className="h-4 w-4" />
            </button>
          </div>
        </section>
      )}

      {/* Scope Info Badge */}
      {!isBod && userDivision && (
        <section className="rounded-card-lg border border-info/30 bg-info/10 p-3.5 flex items-center justify-between text-xs text-navy font-semibold">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-info" />
            <span>Perizinan Scope Terkunci: Menampilkan tenant khusus Divisi <strong>{userDivision}</strong>.</span>
          </div>
          <span className="rounded-pill bg-info/20 px-2.5 py-0.5 text-info font-mono">Isolated Scope</span>
        </section>
      )}

      {/* KPI Cards */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-card-lg border border-line/40 bg-white/80 backdrop-blur-md p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-500">Total Omset Tenant</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-card bg-primary/10 text-primary">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-black text-navy">Rp {totalTenantRev.toLocaleString('id-ID')}</p>
          <p className="mt-1 text-xs text-success font-semibold flex items-center gap-1">
            <ArrowUpRight className="h-3.5 w-3.5" /> +12.4% vs bulan lalu
          </p>
        </article>

        <article className="rounded-card-lg border border-line/40 bg-white/80 backdrop-blur-md p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-500">Rata-rata Omset / Tenant</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-card bg-info/10 text-info">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-black text-navy">Rp {avgRev.toLocaleString('id-ID')}</p>
          <p className="mt-1 text-xs text-slate-500">{scopedTenants.length} Tenant Aktif</p>
        </article>

        <article className="rounded-card-lg border border-line/40 bg-white/80 backdrop-blur-md p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-500">Top Performing Tenant</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-card bg-success/10 text-success">
              <Award className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-xl font-bold text-navy truncate">{topTenant?.name ?? '-'}</p>
          <p className="mt-1 text-xs text-success font-bold">Rp {(topTenant?.monthlyRevenue ?? 0).toLocaleString('id-ID')}</p>
        </article>

        <article className="rounded-card-lg border border-line/40 bg-white/80 backdrop-blur-md p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-500">Target Achievement</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-card bg-warning/10 text-warning">
              <Store className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-black text-navy">
            {Math.round((totalTenantRev / Math.max(scopedTenants.reduce((a, b) => a + b.monthlyTarget, 0), 1)) * 100)}%
          </p>
          <p className="mt-1 text-xs text-slate-500">Overall Tenant Target</p>
        </article>
      </section>

      {/* Tenant Table & Controls */}
      <section className="rounded-card-lg border border-line/40 bg-white/80 backdrop-blur-md p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nama tenant atau lokasi..."
              className="pl-9 text-xs"
            />
          </div>
        </div>

        <div className="mt-6 overflow-x-auto rounded-card-lg border border-line/40">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface text-xs font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3.5">ID & Tenant</th>
                <th className="px-4 py-3.5">Lokasi</th>
                <th className="px-4 py-3.5">Divisi / Kategori</th>
                <th className="px-4 py-3.5 text-right">Omset Bulan Ini</th>
                <th className="px-4 py-3.5 text-right">Target Tenant</th>
                <th className="px-4 py-3.5 text-center">Achievement</th>
                <th className="px-4 py-3.5 text-center">Status</th>
                {!isPicViewOnly && <th className="px-4 py-3.5 text-center">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-line/40 font-medium">
              {filteredTenants.length > 0 ? (
                filteredTenants.map((item) => {
                  const pct = Math.round((item.monthlyRevenue / Math.max(item.monthlyTarget, 1)) * 100);
                  return (
                    <tr key={item.id} className="hover:bg-surface/50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-bold text-navy">{item.name}</p>
                        <p className="text-[10px] font-mono text-slate-400">{item.id}</p>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600">{item.location}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-pill bg-navy/10 px-2.5 py-0.5 text-xs font-semibold text-navy">
                          {item.division} - {item.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-navy">
                        Rp {item.monthlyRevenue.toLocaleString('id-ID')}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-slate-500">
                        Rp {item.monthlyTarget.toLocaleString('id-ID')}
                      </td>
                      <td className="px-4 py-3 text-center font-bold">{pct}%</td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex items-center rounded-pill px-2.5 py-0.5 text-xs font-bold ${
                            item.status === 'Over Target'
                              ? 'bg-success-light text-success'
                              : item.status === 'On Track'
                                ? 'bg-info/10 text-info'
                                : 'bg-danger-light text-danger'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      {!isPicViewOnly && (
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => {
                              setSelectedTenant(item);
                              setNewTarget(item.monthlyTarget);
                            }}
                            className="rounded-input p-1.5 text-slate-400 hover:bg-slate-100 hover:text-navy transition-colors"
                            title="Edit Target Tenant"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-xs text-slate-400">
                    Tidak ada data tenant untuk divisi ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Edit Target Tenant Modal */}
      {selectedTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-card-lg bg-white p-6 shadow-2xl animate-fade-in-up">
            <h3 className="text-lg font-bold text-navy">Edit Target Tenant</h3>
            <p className="text-xs text-slate-500 mt-1">Ubah target bulanan untuk {selectedTenant.name}</p>
            <form onSubmit={handleSaveTarget} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Target Bulanan (Rp)</label>
                <Input
                  type="number"
                  value={newTarget}
                  onChange={(e) => setNewTarget(parseFloat(e.target.value) || 0)}
                  required
                />
              </div>
              <div className="mt-6 flex items-center justify-end gap-3">
                <Button type="button" variant="secondary" onClick={() => setSelectedTenant(null)}>
                  Batal
                </Button>
                <Button type="submit">Simpan Target</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
