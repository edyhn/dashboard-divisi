import { TrendingUp, Users, Target, Award, ArrowUpRight } from 'lucide-react';
import { StatusPill } from '../components/StatusPill';
import { EmptyState, ErrorState, LoadingState } from '../components/states';
import { OrgFilters } from '../components/filters/OrgFilters';
import { useAuth } from '../session/AuthContext';
import { useBodOverview } from '../hooks/useBod';
import { useOrgFilters } from '../components/filters/OrgFilters';

function formatScope(role: string | undefined, divisionCode: string | null | undefined) {
  if (!divisionCode) return `${role ?? '-'} · semua divisi`;
  return `${role} · ${divisionCode}`;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { data, isLoading, error, refetch } = useBodOverview();
  const { divisionCode } = useOrgFilters();

  if (isLoading) return <LoadingState label="Memuat overview BOD..." />;
  if (error) {
    const e = error as unknown as { message?: string; traceId?: string; status?: number };
    return <ErrorState description={e.message ?? 'Gagal memuat overview'} traceId={e.traceId} onRetry={() => void refetch()} />;
  }
  if (!data || data.length === 0) return <EmptyState title="Belum ada data" description="Overview kosong — seed 7 divisi belum tersedia." />;

  const filtered = divisionCode ? data.filter((d) => d.divisionCode === divisionCode) : data;

  const metrics = [
    { label: 'Divisi Aktif', value: String(filtered.length), delta: '7 total', tone: 'text-primary', icon: Target, bg: 'bg-primary-light', color: 'text-primary' },
    { label: 'Avg Achievement', value: `${Math.round(filtered.reduce((a, d) => a + (d.target.achievement ?? 0), 0) / Math.max(filtered.length,1))}%`, delta: 'Target', tone: 'text-success', icon: TrendingUp, bg: 'bg-success-light', color: 'text-success' },
    { label: 'MC Forex', value: filtered.find((d) => d.divisionCode === 'MC') ? 'Aktif' : '-', delta: 'forex.volume', tone: 'text-info', icon: Award, bg: 'bg-info/10', color: 'text-info' },
    { label: 'Workforce', value: String(filtered.reduce((a, d) => a + (d.workforce.count ?? 0), 0)), delta: 'Total count', tone: 'text-navy', icon: Users, bg: 'bg-surface-2', color: 'text-navy' },
  ];

  const rankings = [...filtered]
    .sort((a, b) => (b.target.achievement ?? 0) - (a.target.achievement ?? 0))
    .slice(0, 5)
    .map((d) => ({
      outlet: `${d.divisionCode}-001`,
      division: d.divisionName,
      revenue: d.revenue.gross != null ? `Rp ${d.revenue.gross}` : '—',
      achievement: `${d.target.achievement ?? 0}%`,
      status: d.target.achievement >= 100 ? 'Over target' : d.target.achievement >= 85 ? 'Monitor' : 'Action needed',
    }));

  const trend = filtered.slice(0, 7).map((d) => (d.target.achievement ?? 0) + 50);
  const maxTrend = Math.max(...trend, 1);

  return (
    <div className="space-y-6">
      <section className="rounded-card-lg border border-line/60 bg-gradient-to-br from-white to-surface p-6 shadow-card">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="inline-flex items-center gap2 rounded-pill bg-primary px3 py1 text-xs font-medium text-white">● Real BE</div>
            <h1 className="mt2 text-2xl lg:text-3xl font-bold tracking-tight text-navy">Ringkasan performa operasional</h1>
            <p className="mt-2 text-sm text-slate-500">{formatScope(user?.role, user?.divisionCode)} · periode berjalan · <span className="font-mono text-xs bg-surface px1.5 py0.5 rounded">trace_id</span> envelope</p>
          </div>
          <div className="flex items-center gap2 rounded-card-lg bg-success-light border border-success/20 px4 py3 text-sm">
            <div className="h2 w2 rounded-full bg-success animate-pulse" />
            <span className="font-medium text-success">Sinkron real-time</span>
            <span className="text-success/70">· {filtered.length} divisi</span>
          </div>
        </div>
        <div className="mt-6"><OrgFilters /></div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <article key={m.label} className="group rounded-card-lg border border-line/60 bg-white p-5 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all">
              <div className="flex items-start justify-between">
                <div className={`flex h10 w10 items-center justify-center rounded-card-lg ${m.bg} ${m.color}`}><Icon className="h5 w5" /></div>
                <ArrowUpRight className="h4 w4 text-slate-300 group-hover:text-slate-400 transition-colors" />
              </div>
              <p className="mt-4 text-sm font-medium text-slate-500">{m.label}</p>
              <p className="mt-1 text-2xl lg:text-3xl font-bold tracking-tight text-navy">{m.value}</p>
              <p className={`mt-1 text-xs font-medium ${m.tone}`}>{m.delta}</p>
            </article>
          );
        })}
      </section>

      <section className="rounded-card-lg border border-line/60 bg-white p-6 shadow-card">
        <h2 className="text-base font-semibold text-navy">Kesehatan data</h2>
        <p className="text-sm text-slate-500">Real BE — freshness per divisi dari overview.</p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {filtered.slice(0, 3).map((d) => (
            <div key={d.divisionCode} className="rounded-card-lg border border-line/60 p-4 hover:bg-surface/50 transition-colors">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-navy">{d.divisionCode}</p>
                <span className="h2 w2 rounded-full bg-success/60" />
              </div>
              <p className="mt-1 text-xs font-mono text-slate-500">{d.revenue.source}</p>
              <p className="mt1 text-xs text-slate-400">{new Date(d.revenue.freshness).toLocaleDateString('id-ID')}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
        <article className="rounded-card-lg border border-line/60 bg-white p-6 shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-navy">Trend achievement</h2>
              <p className="text-sm text-slate-500">Per divisi · dari BOD overview</p>
            </div>
            <span className="rounded-pill bg-success-light px-3 py-1 text-xs font-semibold text-success border border-success/20">Real data</span>
          </div>
          <div className="mt-6 flex h-48 items-end gap-2" role="img" aria-label="Trend achievement per divisi">
            {trend.map((v, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-2 group">
                <div className="w-full rounded-t-card bg-gradient-to-t from-primary to-primary-dark group-hover:from-primary-dark group-hover:to-primary transition-all" style={{ height: `${(v / maxTrend) * 100}%` }} />
                <span className="text-xs font-medium text-slate-500">{filtered[i]?.divisionCode ?? `W${i + 1}`}</span>
              </div>
            ))}
          </div>
        </article>
        <article className="rounded-card-lg border border-line/60 bg-white p-6 shadow-card">
          <h2 className="text-base font-semibold text-navy">Ringkasan tindakan</h2>
          <div className="mt-4 space-y-3">
            <div className="rounded-card-lg border border-line/60 p-4 bg-surface/30">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Periode</p>
              <p className="mt-1 font-semibold text-navy">{filtered[0]?.period.from} → {filtered[0]?.period.to}</p>
            </div>
            <div className="rounded-card-lg border border-line/60 p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Freshness</p>
              <p className="mt-1 text-sm font-semibold text-success flex items-center gap1.5"><span className="h2 w2 rounded-full bg-success animate-pulse" />BOD overview real</p>
            </div>
          </div>
        </article>
      </section>

      <section className="rounded-card-lg border border-line/60 bg-white p-6 shadow-card">
        <h2 className="text-base font-semibold text-navy">Drill-down action</h2>
        <p className="text-sm text-slate-500">Aksi cepat dari overview real.</p>
        <div className="mt-4 flex gap-2">
          <button type="button" className="rounded-input bg-navy px-4 py-2 text-sm font-medium text-white hover:bg-navy-light transition-colors">Buka action center</button>
          <button type="button" className="rounded-input border border-line bg-white px-4 py-2 text-sm font-medium text-navy hover:bg-surface transition-colors">Lihat detail</button>
        </div>
      </section>

      <section className="rounded-card-lg border border-line/60 bg-white p-6 shadow-card">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-navy">Ranking outlet</h2>
            <p className="text-sm text-slate-500">Diurutkan achievement · real dari overview</p>
          </div>
          <span className="text-xs font-mono text-slate-400">trace_id</span>
        </div>
        <div className="mt-4 overflow-x-auto rounded-card-lg border border-line/60">
          <table className="min-w-[720px] w-full text-left text-sm">
            <caption className="sr-only">Ranking outlet</caption>
            <thead className="bg-surface text-slate-500">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">Outlet</th>
                <th scope="col" className="px-4 py-3 font-medium">Divisi</th>
                <th scope="col" className="px-4 py-3 font-medium">Omzet</th>
                <th scope="col" className="px-4 py-3 font-medium">Achievement</th>
                <th scope="col" className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/60">
              {rankings.map((row) => (
                <tr key={row.outlet} className="hover:bg-surface/50 transition-colors">
                  <td className="px-4 py-3 font-semibold text-navy">{row.outlet}</td>
                  <td className="px-4 py-3 text-slate-600">{row.division}</td>
                  <td className="px-4 py-3 text-slate-600 font-mono text-xs">{row.revenue}</td>
                  <td className="px-4 py-3 text-slate-600">{row.achievement}</td>
                  <td className="px-4 py-3"><StatusPill status={row.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
          <p className="mt-2 text-xs text-slate-400 lg:hidden">Geser → untuk lihat kolom</p>
      </section>
    </div>
  );
}
