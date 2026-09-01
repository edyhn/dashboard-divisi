import { StatusPill } from '../components/StatusPill';

const imports = [
  { batch: 'REV-2026-08-001', file: 'omzet-minimarket-aug.xlsx', division: 'MINI', status: 'Posted', rows: '1.240', amount: 'Rp 482 jt' },
  { batch: 'REV-2026-08-002', file: 'omzet-cellular-aug.xlsx', division: 'CELL', status: 'Validasi', rows: '842', amount: 'Rp 431 jt' },
  { batch: 'REV-2026-08-003', file: 'omzet-fnb-aug.xlsx', division: 'FNB', status: 'Warning', rows: '519', amount: 'Rp 386 jt' },
];

const validationRows = [
  { row: 18, outlet: 'CELL-001', issue: 'Tanggal di luar periode', severity: 'Warning', suggestion: 'Pindahkan ke batch September' },
  { row: 44, outlet: 'FNB-001', issue: 'Nilai net kosong', severity: 'Fail', suggestion: 'Isi net revenue atau tandai retur' },
  { row: 92, outlet: 'MC-001', issue: 'Valuta terdeteksi', severity: 'Warning', suggestion: 'Review manual sebagai forex, bukan omzet otomatis' },
];

const mapping = [
  { source: 'Tanggal Transaksi', target: 'transactionDate', status: 'Mapped' },
  { source: 'Kode Outlet', target: 'outletCode', status: 'Mapped' },
  { source: 'Gross Sales', target: 'grossRevenue', status: 'Mapped' },
  { source: 'Net Sales', target: 'netRevenue', status: 'Need review' },
];

const reconciliation = [
  { outlet: 'MINI-001', daily: 'Rp 482 jt', monthly: 'Rp 482 jt', difference: 'Rp 0', status: 'Match' },
  { outlet: 'CELL-001', daily: 'Rp 431 jt', monthly: 'Rp 427 jt', difference: 'Rp 4 jt', status: 'Difference' },
  { outlet: 'FNB-001', daily: 'Rp 386 jt', monthly: 'Rp 386 jt', difference: 'Rp 0', status: 'Match' },
];

const corrections = [
  { batch: 'REV-COR-2026-08-001', original: 'REV-2026-08-003', mode: 'Superseded batch', status: 'Draft' },
  { batch: 'REV-REV-2026-08-001', original: 'REV-2026-08-002', mode: 'Reversal', status: 'Review' },
];

export default function OmzetPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-card border border-line bg-white p-5 shadow-card">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="text-sm font-medium text-primary">Revenue Import</p>
            <h1 className="mt-1 text-2xl font-semibold text-navy">Data Omzet</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">Flow mock untuk upload Excel, mapping kolom, validasi baris, dan posting batch tanpa API/DB.</p>
          </div>
          <button type="button" className="rounded-input bg-primary px-4 py-2 text-sm font-medium text-white">Download Template</button>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <article className="rounded-card border border-dashed border-primary bg-white p-6 shadow-card">
          <p className="text-sm font-medium text-primary">Upload Excel</p>
          <h2 className="mt-2 text-lg font-semibold text-navy">Tarik file omzet ke sini</h2>
          <p className="mt-2 text-sm text-slate-500">Format .xlsx maksimal 10 MB. File disimpan private saat BE siap.</p>
          <div className="mt-5 rounded-card bg-surface p-4 text-sm text-slate-600">
            <p className="font-medium text-navy">omzet-cellular-aug.xlsx</p>
            <p className="mt-1">842 rows · checksum mock: 48a9c1</p>
          </div>
          <button type="button" className="mt-5 w-full rounded-input bg-primary px-4 py-2 text-sm font-medium text-white">Validasi File</button>
        </article>

        <article className="rounded-card border border-line bg-white p-5 shadow-card">
          <h2 className="text-lg font-semibold text-navy">Mapping kolom</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {mapping.map((item) => (
              <div key={item.source} className="rounded-card border border-line p-4">
                <p className="text-sm font-medium text-navy">{item.source}</p>
                <p className="mt-1 text-sm text-slate-500">{item.target}</p>
                <div className="mt-3"><StatusPill status={item.status} /></div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-card border border-line bg-white p-5 shadow-card">
          <p className="text-sm text-slate-500">Valid rows</p>
          <p className="mt-3 text-2xl font-semibold text-success">812</p>
          <p className="mt-2 text-sm text-slate-500">Siap diposting</p>
        </article>
        <article className="rounded-card border border-line bg-white p-5 shadow-card">
          <p className="text-sm text-slate-500">Warnings</p>
          <p className="mt-3 text-2xl font-semibold text-warning">28</p>
          <p className="mt-2 text-sm text-slate-500">Bisa diposting setelah review</p>
        </article>
        <article className="rounded-card border border-line bg-white p-5 shadow-card">
          <p className="text-sm text-slate-500">Failed</p>
          <p className="mt-3 text-2xl font-semibold text-danger">2</p>
          <p className="mt-2 text-sm text-slate-500">Wajib diperbaiki</p>
        </article>
      </section>

      <section className="rounded-card border border-line bg-white p-5 shadow-card">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-navy">Preview validasi</h2>
            <p className="text-sm text-slate-500">Kode error dan saran perbaikan per baris</p>
          </div>
          <button type="button" className="rounded-input border border-line px-3 py-2 text-sm font-medium text-navy">Download Error Report</button>
        </div>
        <div className="mt-4 overflow-x-auto rounded-card border border-line">
          <table className="min-w-[720px] w-full text-left text-sm">
            <thead className="bg-surface text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Row</th>
                <th className="px-4 py-3 font-medium">Outlet</th>
                <th className="px-4 py-3 font-medium">Issue</th>
                <th className="px-4 py-3 font-medium">Severity</th>
                <th className="px-4 py-3 font-medium">Saran</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {validationRows.map((row) => (
                <tr key={row.row}>
                  <td className="px-4 py-3 font-medium text-navy">{row.row}</td>
                  <td className="px-4 py-3 text-slate-600">{row.outlet}</td>
                  <td className="px-4 py-3 text-slate-600">{row.issue}</td>
                  <td className="px-4 py-3"><StatusPill status={row.severity} /></td>
                  <td className="px-4 py-3 text-slate-600">{row.suggestion}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-card border border-line bg-white p-5 shadow-card">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-navy">Rekonsiliasi daily vs monthly</h2>
              <p className="text-sm text-slate-500">Difference workflow sebelum confirm dan lock periode.</p>
            </div>
            <button type="button" className="rounded-input border border-line px-3 py-2 text-sm font-medium text-navy">Confirm & lock</button>
          </div>
          <div className="mt-4 overflow-x-auto rounded-card border border-line">
            <table className="min-w-[720px] w-full text-left text-sm">
              <thead className="bg-surface text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Outlet</th>
                  <th className="px-4 py-3 font-medium">Daily</th>
                  <th className="px-4 py-3 font-medium">Monthly</th>
                  <th className="px-4 py-3 font-medium">Selisih</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {reconciliation.map((row) => (
                  <tr key={row.outlet}>
                    <td className="px-4 py-3 font-medium text-navy">{row.outlet}</td>
                    <td className="px-4 py-3 text-slate-600">{row.daily}</td>
                    <td className="px-4 py-3 text-slate-600">{row.monthly}</td>
                    <td className="px-4 py-3 text-slate-600">{row.difference}</td>
                    <td className="px-4 py-3"><StatusPill status={row.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="rounded-card border border-line bg-white p-5 shadow-card">
          <h2 className="text-lg font-semibold text-navy">Correction workflow</h2>
          <p className="text-sm text-slate-500">Koreksi tidak overwrite data posted; gunakan superseded batch atau reversal.</p>
          <div className="mt-4 space-y-3">
            {corrections.map((item) => (
              <div key={item.batch} className="rounded-card border border-line p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-navy">{item.batch}</p>
                    <p className="mt-1 text-sm text-slate-500">{item.mode} dari {item.original}</p>
                  </div>
                  <StatusPill status={item.status} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-card bg-primary/10 p-4 text-sm text-primary">Idempotency key dan audit event wajib saat BE siap.</div>
        </article>
      </section>

      <section className="rounded-card border border-line bg-white p-5 shadow-card">
        <h2 className="text-lg font-semibold text-navy">Recent imports</h2>
        <div className="mt-4 space-y-3">
          {imports.map((item) => (
            <div key={item.batch} className="flex flex-col gap-3 rounded-card border border-line p-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-medium text-navy">{item.batch}</p>
                <p className="text-sm text-slate-500">{item.file} · {item.division} · {item.rows} rows</p>
              </div>
              <div className="flex items-center gap-4">
                <p className="text-sm font-medium text-navy">{item.amount}</p>
                <StatusPill status={item.status} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
