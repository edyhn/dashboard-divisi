import { StatusPill } from '../components/StatusPill';

const attendanceRows = [
  { date: '2026-08-27', division: 'Minimarket', present: 32, leave: 2, overtime: '12 jam', anomaly: 'Shift malam belum sinkron' },
  { date: '2026-08-27', division: 'Cellular', present: 21, leave: 1, overtime: '8 jam', anomaly: 'Normal' },
  { date: '2026-08-27', division: 'FnB', present: 18, leave: 0, overtime: '6 jam', anomaly: '1 checkout terlambat' },
  { date: '2026-08-27', division: 'Wrapping', present: 14, leave: 1, overtime: '5 jam', anomaly: 'Normal' },
];

const importBatches = [
  { id: 'HR-ATT-2026-08-001', domain: 'Attendance', file: 'sobathr-attendance-aug.xlsx', rows: '1.904', status: 'Mapped' },
  { id: 'HR-LEV-2026-08-001', domain: 'Leave', file: 'sobathr-leave-aug.xlsx', rows: '42', status: 'Review' },
  { id: 'HR-OVT-2026-08-001', domain: 'Overtime', file: 'sobathr-overtime-aug.xlsx', rows: '118', status: 'Validated' },
  { id: 'HR-PAY-2026-08-001', domain: 'Payroll', file: 'sobathr-payroll-summary-aug.xlsx', rows: '7', status: 'BOD only' },
];

const selfViewRows = [
  { label: 'Jadwal hari ini', value: 'Shift pagi · MINI-001', visibility: 'USER bisa lihat data sendiri' },
  { label: 'Cuti berjalan', value: '0 aktif · 1 menunggu', visibility: 'Tidak melihat data karyawan lain' },
  { label: 'Lembur minggu ini', value: '4 jam', visibility: 'Nominal payroll disembunyikan' },
];

export default function WorkforcePage() {
  const totalPresent = attendanceRows.reduce((sum, row) => sum + row.present, 0);
  const totalLeave = attendanceRows.reduce((sum, row) => sum + row.leave, 0);

  return (
    <div className="space-y-6">
      <section className="rounded-card border border-line bg-white p-5 shadow-card">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="text-sm font-medium text-primary">Workforce Overview</p>
            <h1 className="mt-1 text-2xl font-semibold text-navy">Kehadiran, Cuti, Lembur</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">Mock SobatHR import center, ringkasan workforce scoped, dan employee self-view tanpa API/DB.</p>
          </div>
          <button type="button" className="rounded-input bg-primary px-4 py-2 text-sm font-medium text-white">Import SobatHR</button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <article className="rounded-card border border-line bg-white p-5 shadow-card">
          <p className="text-sm text-slate-500">Hadir hari ini</p>
          <p className="mt-3 text-2xl font-semibold text-success">{totalPresent}/126</p>
          <p className="mt-2 text-sm text-slate-500">Scope divisi aktif</p>
        </article>
        <article className="rounded-card border border-line bg-white p-5 shadow-card">
          <p className="text-sm text-slate-500">Cuti aktif</p>
          <p className="mt-3 text-2xl font-semibold text-warning">{totalLeave} orang</p>
          <p className="mt-2 text-sm text-slate-500">Gabungan approved dan pending</p>
        </article>
        <article className="rounded-card border border-line bg-white p-5 shadow-card">
          <p className="text-sm text-slate-500">Lembur minggu ini</p>
          <p className="mt-3 text-2xl font-semibold text-navy">31 jam</p>
          <p className="mt-2 text-sm text-slate-500">Dari overtime export</p>
        </article>
        <article className="rounded-card border border-line bg-white p-5 shadow-card">
          <p className="text-sm text-slate-500">Unmapped employee</p>
          <p className="mt-3 text-2xl font-semibold text-danger">4</p>
          <p className="mt-2 text-sm text-slate-500">Butuh resolusi HRD</p>
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-card border border-line bg-white p-5 shadow-card">
          <h2 className="text-lg font-semibold text-navy">Ringkasan attendance scoped</h2>
          <div className="mt-4 overflow-hidden rounded-card border border-line">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Tanggal</th>
                  <th className="px-4 py-3 font-medium">Divisi</th>
                  <th className="px-4 py-3 font-medium">Hadir</th>
                  <th className="px-4 py-3 font-medium">Cuti</th>
                  <th className="px-4 py-3 font-medium">Lembur</th>
                  <th className="px-4 py-3 font-medium">Anomali</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {attendanceRows.map((row) => (
                  <tr key={`${row.date}-${row.division}`}>
                    <td className="px-4 py-3 font-medium text-navy">{row.date}</td>
                    <td className="px-4 py-3 text-slate-600">{row.division}</td>
                    <td className="px-4 py-3 text-slate-600">{row.present}</td>
                    <td className="px-4 py-3 text-slate-600">{row.leave}</td>
                    <td className="px-4 py-3 text-slate-600">{row.overtime}</td>
                    <td className="px-4 py-3 text-slate-600">{row.anomaly}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="rounded-card border border-line bg-white p-5 shadow-card">
          <h2 className="text-lg font-semibold text-navy">Import SobatHR</h2>
          <div className="mt-4 space-y-3">
            {importBatches.map((batch) => (
              <div key={batch.id} className="rounded-card border border-line p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-navy">{batch.domain}</p>
                    <p className="mt-1 text-sm text-slate-500">{batch.file}</p>
                  </div>
                  <StatusPill status={batch.status} />
                </div>
                <p className="mt-3 text-sm text-slate-500">{batch.id} · {batch.rows} rows</p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="rounded-card border border-line bg-white p-5 shadow-card">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-navy">Employee self-view</h2>
            <p className="text-sm text-slate-500">Tampilan USER dibatasi ke data sendiri dan tanpa detail payroll sensitif.</p>
          </div>
          <span className="rounded-input bg-primary/10 px-3 py-1 text-sm font-medium text-primary">Privacy guard</span>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {selfViewRows.map((item) => (
            <article key={item.label} className="rounded-card border border-line p-4">
              <p className="text-sm text-slate-500">{item.label}</p>
              <p className="mt-2 font-semibold text-navy">{item.value}</p>
              <p className="mt-2 text-sm text-slate-500">{item.visibility}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
