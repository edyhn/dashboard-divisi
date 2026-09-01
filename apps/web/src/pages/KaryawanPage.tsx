import { StatusPill } from '../components/StatusPill';

const employees = [
  { code: 'EMP-001', name: 'Karyawan Anonim 1', division: 'Minimarket', outlet: 'MINI-001', role: 'Store Crew', status: 'Aktif' },
  { code: 'EMP-002', name: 'Karyawan Anonim 2', division: 'Cellular', outlet: 'CELL-001', role: 'Sales', status: 'Aktif' },
  { code: 'EMP-003', name: 'Karyawan Anonim 3', division: 'Wrapping', outlet: 'WRAP-001', role: 'Operator', status: 'Mutasi' },
  { code: 'EMP-004', name: 'Karyawan Anonim 4', division: 'FnB', outlet: 'FNB-001', role: 'Cashier', status: 'Nonaktif' },
];

const assignments = [
  { employee: 'EMP-003', from: 'MINI-002', to: 'WRAP-001', effective: '2026-08-01', status: 'Efektif' },
  { employee: 'EMP-008', from: 'CELL-002', to: 'CELL-001', effective: '2026-09-01', status: 'Terjadwal' },
  { employee: 'EMP-021', from: 'FNB-001', to: 'MINI-001', effective: '2026-08-15', status: 'Review' },
];

const unmappedRows = [
  { sourceId: 'SHR-7781', name: 'Nama Export A', division: 'Minimarket', suggestion: 'EMP-001', confidence: '94%' },
  { sourceId: 'SHR-8894', name: 'Nama Export B', division: 'Wrapping', suggestion: 'EMP-003', confidence: '71%' },
  { sourceId: 'SHR-9012', name: 'Nama Export C', division: 'FnB', suggestion: 'Buat kandidat baru', confidence: 'Rendah' },
];

export default function KaryawanPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-card border border-line bg-white p-5 shadow-card">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="text-sm font-medium text-primary">HRD Master Data</p>
            <h1 className="mt-1 text-2xl font-semibold text-navy">Data Karyawan</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">Mock employee list anonim, assignment historis, dan resolusi mapping SobatHR tanpa API/DB.</p>
          </div>
          <button type="button" className="rounded-input bg-primary px-4 py-2 text-sm font-medium text-white">Tambah Karyawan</button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <article className="rounded-card border border-line bg-white p-5 shadow-card">
          <p className="text-sm text-slate-500">Karyawan aktif</p>
          <p className="mt-3 text-2xl font-semibold text-success">126</p>
          <p className="mt-2 text-sm text-slate-500">Identitas tampil anonim</p>
        </article>
        <article className="rounded-card border border-line bg-white p-5 shadow-card">
          <p className="text-sm text-slate-500">Assignment historis</p>
          <p className="mt-3 text-2xl font-semibold text-navy">9</p>
          <p className="mt-2 text-sm text-slate-500">Dengan tanggal efektif</p>
        </article>
        <article className="rounded-card border border-line bg-white p-5 shadow-card">
          <p className="text-sm text-slate-500">Unmapped SobatHR</p>
          <p className="mt-3 text-2xl font-semibold text-warning">4</p>
          <p className="mt-2 text-sm text-slate-500">Butuh keputusan HRD</p>
        </article>
        <article className="rounded-card border border-line bg-white p-5 shadow-card">
          <p className="text-sm text-slate-500">Privacy guard</p>
          <p className="mt-3 text-2xl font-semibold text-primary">Aktif</p>
          <p className="mt-2 text-sm text-slate-500">Payroll detail tidak tampil</p>
        </article>
      </section>

      <section className="rounded-card border border-line bg-white p-5 shadow-card">
        <h2 className="text-lg font-semibold text-navy">Daftar karyawan anonim</h2>
        <div className="mt-4 overflow-x-auto rounded-card border border-line">
          <table className="min-w-[720px] w-full text-left text-sm">
            <thead className="bg-surface text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Kode</th>
                <th className="px-4 py-3 font-medium">Nama</th>
                <th className="px-4 py-3 font-medium">Divisi</th>
                <th className="px-4 py-3 font-medium">Outlet</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {employees.map((employee) => (
                <tr key={employee.code}>
                  <td className="px-4 py-3 font-medium text-navy">{employee.code}</td>
                  <td className="px-4 py-3 text-slate-600">{employee.name}</td>
                  <td className="px-4 py-3 text-slate-600">{employee.division}</td>
                  <td className="px-4 py-3 text-slate-600">{employee.outlet}</td>
                  <td className="px-4 py-3 text-slate-600">{employee.role}</td>
                  <td className="px-4 py-3"><StatusPill status={employee.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <article className="rounded-card border border-line bg-white p-5 shadow-card">
          <h2 className="text-lg font-semibold text-navy">Assignment historis</h2>
          <div className="mt-4 space-y-3">
            {assignments.map((assignment) => (
              <div key={`${assignment.employee}-${assignment.effective}`} className="rounded-card border border-line p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-navy">{assignment.employee}</p>
                    <p className="mt-1 text-sm text-slate-500">{assignment.from} → {assignment.to}</p>
                  </div>
                  <StatusPill status={assignment.status} />
                </div>
                <p className="mt-3 text-sm text-slate-500">Efektif {assignment.effective}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-card border border-line bg-white p-5 shadow-card">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-navy">Resolusi UNMAPPED</h2>
              <p className="text-sm text-slate-500">Cocokkan sumber SobatHR ke employee canonical</p>
            </div>
            <button type="button" className="rounded-input border border-line px-3 py-2 text-sm font-medium text-navy">Resolve selected</button>
          </div>
          <div className="mt-4 space-y-3">
            {unmappedRows.map((row) => (
              <div key={row.sourceId} className="rounded-card border border-line p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-navy">{row.sourceId}</p>
                    <p className="mt-1 text-sm text-slate-500">{row.name} · {row.division}</p>
                  </div>
                  <StatusPill status={row.confidence} />
                </div>
                <p className="mt-3 text-sm text-slate-500">Saran: {row.suggestion}</p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
