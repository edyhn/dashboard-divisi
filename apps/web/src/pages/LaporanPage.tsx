import { StatusPill } from '../components/StatusPill';

const reports = [
  { name: 'Executive Overview', module: 'BOD', scope: 'Semua divisi', format: 'PDF/XLSX', status: 'Siap' },
  { name: 'Ringkasan Divisi', module: 'Dashboard', scope: 'Scope role aktif', format: 'PDF/XLSX', status: 'Siap' },
  { name: 'Omzet Bulanan', module: 'Revenue', scope: 'Per divisi/outlet', format: 'XLSX', status: 'Siap' },
  { name: 'Target vs Realisasi', module: 'Target', scope: 'Periode berjalan', format: 'XLSX', status: 'Review' },
  { name: 'Workforce Summary', module: 'HR', scope: 'Agregat saja', format: 'XLSX', status: 'Restricted' },
  { name: 'Payroll Summary', module: 'HR', scope: 'BOD only', format: 'XLSX', status: 'BOD only' },
];

const exportQueue = [
  { id: 'EXP-2026-08-001', report: 'Executive Overview', requester: 'BOD Demo', time: '10:42', status: 'Selesai' },
  { id: 'EXP-2026-08-002', report: 'Omzet Bulanan', requester: 'Manager Minimarket', time: '10:58', status: 'Processing' },
  { id: 'EXP-2026-08-003', report: 'Payroll Summary', requester: 'BOD Demo', time: '11:03', status: 'Masked' },
];

const guardrails = [
  { title: 'Scope role aktif', detail: 'Manager hanya melihat divisi/outlet yang diizinkan.' },
  { title: 'Payroll agregat', detail: 'Export payroll tidak membawa employeeId atau nominal individu.' },
  { title: 'Audit trail', detail: 'Setiap export menyimpan requester, waktu, filter, dan checksum mock.' },
];

export default function LaporanPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-card border border-line bg-white p-5 shadow-card">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="text-sm font-medium text-primary">Reporting Center</p>
            <h1 className="mt-1 text-2xl font-semibold text-navy">Laporan & Export</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">Mock report catalog, export queue, dan guardrail akses lintas divisi tanpa API/DB.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="rounded-input border border-line px-4 py-2 text-sm font-medium text-navy">Preview PDF</button>
            <button type="button" className="rounded-input bg-primary px-4 py-2 text-sm font-medium text-white">Export XLSX</button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <article className="rounded-card border border-line bg-white p-5 shadow-card">
          <p className="text-sm text-slate-500">Laporan tersedia</p>
          <p className="mt-3 text-2xl font-semibold text-navy">14</p>
          <p className="mt-2 text-sm text-slate-500">Dashboard, revenue, target, HR</p>
        </article>
        <article className="rounded-card border border-line bg-white p-5 shadow-card">
          <p className="text-sm text-slate-500">Export hari ini</p>
          <p className="mt-3 text-2xl font-semibold text-success">8</p>
          <p className="mt-2 text-sm text-slate-500">3 selesai, 1 processing</p>
        </article>
        <article className="rounded-card border border-line bg-white p-5 shadow-card">
          <p className="text-sm text-slate-500">Restricted report</p>
          <p className="mt-3 text-2xl font-semibold text-primary">2</p>
          <p className="mt-2 text-sm text-slate-500">Payroll dan workforce sensitif</p>
        </article>
        <article className="rounded-card border border-line bg-white p-5 shadow-card">
          <p className="text-sm text-slate-500">Data masking</p>
          <p className="mt-3 text-2xl font-semibold text-warning">Aktif</p>
          <p className="mt-2 text-sm text-slate-500">Field sensitif disaring</p>
        </article>
      </section>

      <section className="rounded-card border border-line bg-white p-5 shadow-card">
        <h2 className="text-lg font-semibold text-navy">Katalog laporan</h2>
        <div className="mt-4 overflow-hidden rounded-card border border-line">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Laporan</th>
                <th className="px-4 py-3 font-medium">Modul</th>
                <th className="px-4 py-3 font-medium">Scope</th>
                <th className="px-4 py-3 font-medium">Format</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {reports.map((report) => (
                <tr key={report.name}>
                  <td className="px-4 py-3 font-medium text-navy">{report.name}</td>
                  <td className="px-4 py-3 text-slate-600">{report.module}</td>
                  <td className="px-4 py-3 text-slate-600">{report.scope}</td>
                  <td className="px-4 py-3 text-slate-600">{report.format}</td>
                  <td className="px-4 py-3"><StatusPill status={report.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
        <article className="rounded-card border border-line bg-white p-5 shadow-card">
          <h2 className="text-lg font-semibold text-navy">Export queue</h2>
          <div className="mt-4 space-y-3">
            {exportQueue.map((item) => (
              <div key={item.id} className="rounded-card border border-line p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-navy">{item.report}</p>
                    <p className="mt-1 text-sm text-slate-500">{item.id} · {item.requester} · {item.time}</p>
                  </div>
                  <StatusPill status={item.status} />
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-card border border-line bg-white p-5 shadow-card">
          <h2 className="text-lg font-semibold text-navy">Access guardrail</h2>
          <div className="mt-4 space-y-3">
            {guardrails.map((item) => (
              <div key={item.title} className="rounded-card border border-line p-4">
                <p className="font-medium text-navy">{item.title}</p>
                <p className="mt-1 text-sm text-slate-500">{item.detail}</p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
