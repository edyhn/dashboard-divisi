import { StatusPill } from '../components/StatusPill';

const divisions = [
  { code: 'MINI', name: 'Minimarket', modules: 'Revenue, Target, Workforce', outlets: 12, status: 'Aktif' },
  { code: 'CELL', name: 'Cellular', modules: 'Revenue, Target', outlets: 8, status: 'Aktif' },
  { code: 'WRAP', name: 'Wrapping', modules: 'Revenue, Assessment', outlets: 6, status: 'Aktif' },
  { code: 'FNB', name: 'FnB', modules: 'Revenue, Workforce', outlets: 5, status: 'Draft' },
  { code: 'MC', name: 'Money Changer', modules: 'Forex guard, Reporting', outlets: 3, status: 'Restricted' },
];

const outlets = [
  { code: 'MINI-001', division: 'MINI', city: 'Jakarta', manager: 'Mina Demo', status: 'Aktif' },
  { code: 'CELL-001', division: 'CELL', city: 'Bandung', manager: 'Admin Demo', status: 'Aktif' },
  { code: 'WRAP-001', division: 'WRAP', city: 'Surabaya', manager: 'Wira Demo', status: 'Aktif' },
  { code: 'FNB-001', division: 'FNB', city: 'Jakarta', manager: 'Fina Demo', status: 'Draft' },
  { code: 'MC-001', division: 'MC', city: 'Medan', manager: 'Mira Demo', status: 'Restricted' },
];

const rules = [
  { title: 'Aktif/nonaktif terkontrol', detail: 'Divisi atau outlet nonaktif tetap tersimpan untuk histori dan tidak muncul di input baru.' },
  { title: 'Module toggle per divisi', detail: 'Revenue, target, workforce, assessment, dan report dapat diaktifkan sesuai kebutuhan divisi.' },
  { title: 'Money Changer guard', detail: 'Transaksi valuta ditandai restricted dan tidak otomatis masuk omzet retail.' },
];

export default function KonfigurasiPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-card border border-line bg-white p-5 shadow-card">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="text-sm font-medium text-primary">Superadmin Configuration</p>
            <h1 className="mt-1 text-2xl font-semibold text-navy">Konfigurasi Divisi & Outlet</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">Mock konfigurasi aktif/nonaktif divisi, outlet, dan module toggle tanpa API/DB.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="rounded-input border border-line px-4 py-2 text-sm font-medium text-navy">Preview perubahan</button>
            <button type="button" className="rounded-input bg-primary px-4 py-2 text-sm font-medium text-white">Simpan konfigurasi</button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <article className="rounded-card border border-line bg-white p-5 shadow-card">
          <p className="text-sm text-slate-500">Divisi aktif</p>
          <p className="mt-3 text-2xl font-semibold text-success">3/5</p>
          <p className="mt-2 text-sm text-slate-500">2 draft/restricted</p>
        </article>
        <article className="rounded-card border border-line bg-white p-5 shadow-card">
          <p className="text-sm text-slate-500">Outlet aktif</p>
          <p className="mt-3 text-2xl font-semibold text-navy">34</p>
          <p className="mt-2 text-sm text-slate-500">Lintas 5 divisi</p>
        </article>
        <article className="rounded-card border border-line bg-white p-5 shadow-card">
          <p className="text-sm text-slate-500">Module toggle</p>
          <p className="mt-3 text-2xl font-semibold text-primary">12</p>
          <p className="mt-2 text-sm text-slate-500">Config-driven dashboard</p>
        </article>
        <article className="rounded-card border border-line bg-white p-5 shadow-card">
          <p className="text-sm text-slate-500">Audit config</p>
          <p className="mt-3 text-2xl font-semibold text-warning">Wajib</p>
          <p className="mt-2 text-sm text-slate-500">Semua perubahan tercatat</p>
        </article>
      </section>

      <section className="rounded-card border border-line bg-white p-5 shadow-card">
        <h2 className="text-lg font-semibold text-navy">Divisi</h2>
        <div className="mt-4 overflow-x-auto rounded-card border border-line">
          <table className="min-w-[720px] w-full text-left text-sm">
            <thead className="bg-surface text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Kode</th>
                <th className="px-4 py-3 font-medium">Nama</th>
                <th className="px-4 py-3 font-medium">Module</th>
                <th className="px-4 py-3 font-medium">Outlet</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {divisions.map((division) => (
                <tr key={division.code}>
                  <td className="px-4 py-3 font-medium text-navy">{division.code}</td>
                  <td className="px-4 py-3 text-slate-600">{division.name}</td>
                  <td className="px-4 py-3 text-slate-600">{division.modules}</td>
                  <td className="px-4 py-3 text-slate-600">{division.outlets}</td>
                  <td className="px-4 py-3"><StatusPill status={division.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-card border border-line bg-white p-5 shadow-card">
          <h2 className="text-lg font-semibold text-navy">Outlet</h2>
          <div className="mt-4 space-y-3">
            {outlets.map((outlet) => (
              <div key={outlet.code} className="rounded-card border border-line p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-navy">{outlet.code}</p>
                    <p className="mt-1 text-sm text-slate-500">{outlet.division} · {outlet.city} · {outlet.manager}</p>
                  </div>
                  <StatusPill status={outlet.status} />
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-card border border-line bg-white p-5 shadow-card">
          <h2 className="text-lg font-semibold text-navy">Aturan konfigurasi</h2>
          <div className="mt-4 space-y-3">
            {rules.map((rule) => (
              <div key={rule.title} className="rounded-card border border-line p-4">
                <p className="font-medium text-navy">{rule.title}</p>
                <p className="mt-1 text-sm text-slate-500">{rule.detail}</p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
