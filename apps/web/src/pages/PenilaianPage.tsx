import { StatusPill } from '../components/StatusPill';

const indicators = [
  { name: 'Kedisiplinan operasional', weight: 25, score: 92, evidence: 'Absensi stabil, keterlambatan rendah' },
  { name: 'Pencapaian target outlet', weight: 35, score: 88, evidence: 'Achievement 87,6% periode berjalan' },
  { name: 'Kualitas layanan', weight: 20, score: 95, evidence: 'Komplain turun 14%' },
  { name: 'Administrasi & pelaporan', weight: 20, score: 90, evidence: 'Laporan mingguan lengkap' },
];

const assessments = [
  { subject: 'Manager MINI-001', template: 'Outlet Manager', score: '90,8', status: 'Review Manager' },
  { subject: 'Team CELL-001', template: 'Sales Team', score: '89,7', status: 'Submitted' },
  { subject: 'Ops WRAP-001', template: 'Operasional', score: '86,1', status: 'Draft' },
];

const checklist = [
  { item: 'Bobot total 100%', status: 'Valid' },
  { item: 'Semua indikator memiliki skor', status: 'Valid' },
  { item: 'Evidence minimum terisi', status: 'Warning' },
  { item: 'Revenue outlet tidak otomatis menjadi skor individu', status: 'Valid' },
];

const approvalQueue = [
  { subject: 'Manager MINI-001', reviewer: 'BOD Demo', action: 'Approve score', status: 'Ready' },
  { subject: 'Team CELL-001', reviewer: 'BOD Demo', action: 'Return evidence', status: 'Needs evidence' },
  { subject: 'Ops WRAP-001', reviewer: 'Manager Wrapping', action: 'Complete draft', status: 'Draft' },
];

const governance = [
  { title: 'Weighted score server-side', detail: 'UI hanya preview; nilai final dihitung ulang server saat BE siap.', status: 'Guarded' },
  { title: 'Revenue as evidence', detail: 'Omzet outlet tidak otomatis menjadi skor individu.', status: 'Valid' },
  { title: 'Approval lock', detail: 'Assessment approved menjadi locked dan koreksi lewat event baru.', status: 'Audit' },
];

export default function PenilaianPage() {
  const weightedScore = indicators.reduce((sum, item) => sum + (item.weight * item.score) / 100, 0);

  return (
    <div className="space-y-6">
      <section className="rounded-card border border-line bg-white p-5 shadow-card">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="text-sm font-medium text-primary">Performance Assessment</p>
            <h1 className="mt-1 text-2xl font-semibold text-navy">Penilaian Performa</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">Flow mock select, score, review, submit untuk KPI berbobot tanpa API/DB.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="rounded-input border border-line px-4 py-2 text-sm font-medium text-navy">Simpan Draft</button>
            <button type="button" className="rounded-input bg-primary px-4 py-2 text-sm font-medium text-white">Submit Review</button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-card border border-line bg-white p-5 shadow-card">
          <p className="text-sm text-slate-500">Weighted score</p>
          <p className="mt-3 text-2xl font-semibold text-primary">{weightedScore.toFixed(1)}</p>
          <p className="mt-2 text-sm text-slate-500">Dihitung dari skor x bobot</p>
        </article>
        <article className="rounded-card border border-line bg-white p-5 shadow-card">
          <p className="text-sm text-slate-500">Template aktif</p>
          <p className="mt-3 text-2xl font-semibold text-navy">Outlet Manager</p>
          <p className="mt-2 text-sm text-slate-500">4 indikator, total bobot 100%</p>
        </article>
        <article className="rounded-card border border-line bg-white p-5 shadow-card">
          <p className="text-sm text-slate-500">Status</p>
          <p className="mt-3 text-2xl font-semibold text-warning">Review</p>
          <p className="mt-2 text-sm text-slate-500">Siap dikirim setelah evidence lengkap</p>
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <article className="rounded-card border border-line bg-white p-5 shadow-card">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-navy">Skor indikator</h2>
              <p className="text-sm text-slate-500">Mock input skor dan evidence per indikator</p>
            </div>
            <select className="rounded-input border border-line bg-white px-3 py-2 text-sm" defaultValue="MINI-001">
              <option value="MINI-001">Manager MINI-001</option>
              <option value="CELL-001">Team CELL-001</option>
              <option value="WRAP-001">Ops WRAP-001</option>
            </select>
          </div>
          <div className="mt-4 space-y-3">
            {indicators.map((indicator) => (
              <div key={indicator.name} className="rounded-card border border-line p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="font-medium text-navy">{indicator.name}</p>
                    <p className="mt-1 text-sm text-slate-500">Bobot {indicator.weight}% · {indicator.evidence}</p>
                  </div>
                  <div className="w-full md:w-40">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Skor</span>
                      <span className="font-semibold text-navy">{indicator.score}</span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-surface">
                      <div className="h-2 rounded-full bg-primary" style={{ width: `${indicator.score}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-card border border-line bg-white p-5 shadow-card">
          <h2 className="text-lg font-semibold text-navy">Validasi submit</h2>
          <div className="mt-4 space-y-3">
            {checklist.map((item) => (
              <div key={item.item} className="flex items-center justify-between gap-3 rounded-card border border-line p-4">
                <p className="text-sm font-medium text-navy">{item.item}</p>
                <StatusPill status={item.status} />
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-card bg-surface p-4 text-sm text-slate-600">
            Revenue outlet hanya menjadi evidence, bukan skor otomatis individu.
          </div>
        </article>
      </section>

      <section className="rounded-card border border-line bg-white p-5 shadow-card">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-navy">Assessment berjalan</h2>
            <p className="text-sm text-slate-500">Antrian mock draft, review, dan submitted</p>
          </div>
          <button type="button" className="rounded-input border border-line px-3 py-2 text-sm font-medium text-navy">Lihat Riwayat</button>
        </div>
        <div className="mt-4 overflow-x-auto rounded-card border border-line">
          <table className="min-w-[720px] w-full text-left text-sm">
            <thead className="bg-surface text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Subjek</th>
                <th className="px-4 py-3 font-medium">Template</th>
                <th className="px-4 py-3 font-medium">Skor</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {assessments.map((item) => (
                <tr key={item.subject}>
                  <td className="px-4 py-3 font-medium text-navy">{item.subject}</td>
                  <td className="px-4 py-3 text-slate-600">{item.template}</td>
                  <td className="px-4 py-3 text-slate-600">{item.score}</td>
                  <td className="px-4 py-3"><StatusPill status={item.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
        <article className="rounded-card border border-line bg-white p-5 shadow-card">
          <h2 className="text-lg font-semibold text-navy">BOD approval assessment</h2>
          <p className="text-sm text-slate-500">Approve/return mock untuk assessment yang sudah submitted.</p>
          <div className="mt-4 space-y-3">
            {approvalQueue.map((item) => (
              <div key={item.subject} className="rounded-card border border-line p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-navy">{item.subject}</p>
                    <p className="mt-1 text-sm text-slate-500">{item.reviewer} · {item.action}</p>
                  </div>
                  <StatusPill status={item.status} />
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-card border border-line bg-white p-5 shadow-card">
          <h2 className="text-lg font-semibold text-navy">Governance penilaian</h2>
          <div className="mt-4 space-y-3">
            {governance.map((item) => (
              <div key={item.title} className="rounded-card border border-line p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-navy">{item.title}</p>
                    <p className="mt-1 text-sm text-slate-500">{item.detail}</p>
                  </div>
                  <StatusPill status={item.status} />
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
