import { StatusPill } from '../components/StatusPill';
import { OrgFilters } from '../components/filters/OrgFilters';
import { useSession } from '../session/SessionContext';

const metrics = [
  { label: 'Omzet Gross', value: 'Rp 2,84 M', delta: '+12,4%', tone: 'text-success' },
  { label: 'Omzet Net', value: 'Rp 2,51 M', delta: '+9,8%', tone: 'text-success' },
  { label: 'Target Bulanan', value: '87,6%', delta: 'Level A', tone: 'text-primary' },
  { label: 'Skor Performa', value: '91,2', delta: '+3,1 poin', tone: 'text-success' },
];

const trend = [42, 54, 48, 68, 72, 81, 76, 92, 88, 96, 104, 118];

const rankings = [
  { outlet: 'MINI-001', division: 'Minimarket', revenue: 'Rp 482 jt', achievement: '112%', status: 'Over target' },
  { outlet: 'CELL-001', division: 'Cellular', revenue: 'Rp 431 jt', achievement: '104%', status: 'Over target' },
  { outlet: 'FNB-001', division: 'FnB', revenue: 'Rp 386 jt', achievement: '98%', status: 'Monitor' },
  { outlet: 'WRAP-001', division: 'Wrapping', revenue: 'Rp 344 jt', achievement: '93%', status: 'Action needed' },
  { outlet: 'MC-001', division: 'Money Changer', revenue: 'Rp 301 jt', achievement: 'Scope forex', status: 'Guarded' },
];

const dataStates = [
  { label: 'Revenue', state: 'Fresh', detail: 'Posted harian lengkap' },
  { label: 'Target', state: 'Partial', detail: '2 outlet menunggu approval' },
  { label: 'Workforce', state: 'Stale', detail: 'SobatHR terakhir 10 menit lalu' },
  { label: 'Performance', state: 'Warning', detail: '3 evidence belum lengkap' },
];

const drillDown = [
  { title: 'Outlet under target', value: 'WRAP-001', action: 'Buka detail outlet dalam scope WRAP' },
  { title: 'Approval bottleneck', value: '5 target pending', action: 'Review queue BOD' },
  { title: 'Data quality', value: '2 failed rows', action: 'Lihat preview validasi omzet' },
];

const summaries = [
  { title: 'Workforce', value: '126 karyawan aktif', note: '4 cuti, 2 lembur menunggu validasi' },
  { title: 'Approval', value: '8 item pending', note: '5 target, 3 penilaian performa' },
  { title: 'Freshness', value: 'Sinkron 10 menit lalu', note: 'Omzet harian sudah posted' },
];

function formatScope(role: string, divisionCode: string | null) {
  if (!divisionCode) return `${role} · semua divisi`;
  return `${role} · ${divisionCode}`;
}

export default function DashboardPage() {
  const { user } = useSession();
  const maxTrend = Math.max(...trend);

  return (
    <div className="space-y-6">
      <section className="rounded-card border border-line bg-white p-5 shadow-card">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-medium text-primary">Dashboard Divisi</p>
            <h1 className="mt-1 text-2xl font-semibold text-navy">Ringkasan performa operasional</h1>
            <p className="mt-2 text-sm text-slate-500">{formatScope(user.role, user.divisionCode)} · periode berjalan · data mock UI-first</p>
          </div>
          <div className="rounded-card bg-surface px-4 py-3 text-sm text-slate-600">
            <span className="font-medium text-navy">Status data:</span> sebagian tersedia
          </div>
        </div>
        <div className="mt-5">
          <OrgFilters />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <article key={metric.label} className="rounded-card border border-line bg-white p-5 shadow-card">
            <p className="text-sm text-slate-500">{metric.label}</p>
            <p className="mt-3 text-2xl font-semibold text-navy">{metric.value}</p>
            <p className={`mt-2 text-sm font-medium ${metric.tone}`}>{metric.delta}</p>
          </article>
        ))}
      </section>

      <section className="rounded-card border border-line bg-white p-5 shadow-card">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-navy">Kesehatan data</h2>
            <p className="text-sm text-slate-500">State loading/partial/stale/warning untuk modul utama.</p>
          </div>
          <span className="rounded-input bg-warning/10 px-3 py-1 text-sm font-medium text-warning">Partial data</span>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          {dataStates.map((item) => (
            <article key={item.label} className="rounded-card border border-line p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium text-navy">{item.label}</p>
                <StatusPill status={item.state} />
              </div>
              <p className="mt-2 text-sm text-slate-500">{item.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.3fr_1fr]">
        <article className="rounded-card border border-line bg-white p-5 shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-navy">Trend omzet</h2>
              <p className="text-sm text-slate-500">12 minggu terakhir</p>
            </div>
            <span className="rounded-input bg-success/10 px-3 py-1 text-sm font-medium text-success">Naik 18%</span>
          </div>
          <div className="mt-6 flex h-52 items-end gap-2" role="img" aria-label="Grafik batang trend omzet 12 minggu">
            {trend.map((value, index) => (
              <div key={index} className="flex flex-1 flex-col items-center gap-2">
                <div className="w-full rounded-t-input bg-primary" style={{ height: `${(value / maxTrend) * 100}%` }} />
                <span className="text-[10px] text-slate-400">W{index + 1}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-card border border-line bg-white p-5 shadow-card">
          <h2 className="text-lg font-semibold text-navy">Ringkasan tindakan</h2>
          <div className="mt-4 space-y-3">
            {summaries.map((item) => (
              <div key={item.title} className="rounded-card border border-line p-4">
                <p className="text-sm text-slate-500">{item.title}</p>
                <p className="mt-1 font-semibold text-navy">{item.value}</p>
                <p className="mt-1 text-sm text-slate-500">{item.note}</p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="rounded-card border border-line bg-white p-5 shadow-card">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-navy">Ranking outlet</h2>
            <p className="text-sm text-slate-500">Drill-down tetap mengikuti scope role aktif</p>
          </div>
          <button type="button" className="rounded-input border border-line px-3 py-2 text-sm font-medium text-navy">Lihat detail</button>
        </div>
        <div className="mt-4 overflow-x-auto rounded-card border border-line">
          <table className="min-w-[720px] w-full text-left text-sm">
            <thead className="bg-surface text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Outlet</th>
                <th className="px-4 py-3 font-medium">Divisi</th>
                <th className="px-4 py-3 font-medium">Omzet</th>
                <th className="px-4 py-3 font-medium">Achievement</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rankings.map((row) => (
                <tr key={row.outlet}>
                  <td className="px-4 py-3 font-medium text-navy">{row.outlet}</td>
                  <td className="px-4 py-3 text-slate-600">{row.division}</td>
                  <td className="px-4 py-3 text-slate-600">{row.revenue}</td>
                  <td className="px-4 py-3 text-slate-600">{row.achievement}</td>
                  <td className="px-4 py-3"><StatusPill status={row.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-card border border-line bg-white p-5 shadow-card">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-navy">Drill-down action</h2>
            <p className="text-sm text-slate-500">Aksi cepat tetap mengikuti scope role aktif.</p>
          </div>
          <button type="button" className="rounded-input border border-line px-3 py-2 text-sm font-medium text-navy">Buka action center</button>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {drillDown.map((item) => (
            <article key={item.title} className="rounded-card border border-line p-4">
              <p className="text-sm text-slate-500">{item.title}</p>
              <p className="mt-2 font-semibold text-navy">{item.value}</p>
              <p className="mt-2 text-sm text-slate-500">{item.action}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
