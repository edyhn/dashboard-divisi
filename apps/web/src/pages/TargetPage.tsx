import { StatusPill } from '../components/StatusPill';

const outlets = [
  { outlet: 'MINI-001', division: 'Minimarket', target: 550, realization: 482, owner: 'Manager Minimarket', status: 'Submitted' },
  { outlet: 'CELL-001', division: 'Cellular', target: 415, realization: 431, owner: 'Manager Cellular', status: 'Approved' },
  { outlet: 'FNB-001', division: 'FnB', target: 395, realization: 386, owner: 'Manager FnB', status: 'Draft' },
  { outlet: 'WRAP-001', division: 'Wrapping', target: 370, realization: 344, owner: 'Manager Wrapping', status: 'Returned' },
];

const approvals = [
  { item: 'Target MINI Agustus', requester: 'Manager Minimarket', status: 'Menunggu BOD', age: '2 jam' },
  { item: 'Revisi WRAP Agustus', requester: 'Manager Wrapping', status: 'Returned', age: '1 hari' },
  { item: 'Target FNB Agustus', requester: 'Manager FnB', status: 'Draft', age: '3 hari' },
];

const timeline = [
  { step: 'Draft', detail: 'Target per outlet diisi manager', state: 'Selesai' },
  { step: 'Submit', detail: 'Manager mengirim ke BOD', state: 'Aktif' },
  { step: 'Review', detail: 'BOD approve atau return', state: 'Menunggu' },
  { step: 'Lock', detail: 'Target terkunci untuk periode berjalan', state: 'Belum' },
];

const bodQueue = [
  { request: 'Target MINI Agustus', submitter: 'Manager Minimarket', action: 'Approve', status: 'Ready' },
  { request: 'Target WRAP Revisi', submitter: 'Manager Wrapping', action: 'Return with note', status: 'Needs note' },
  { request: 'Target FNB Draft', submitter: 'Manager FnB', action: 'Wait submit', status: 'Blocked' },
];

const governance = [
  { title: 'Segregation of duties', detail: 'Pembuat target tidak bisa approve target yang sama.', status: 'Enforced' },
  { title: 'Append-only approval', detail: 'Approve/return/reopen menjadi event baru, bukan update diam-diam.', status: 'Audit' },
  { title: 'Privileged reopen', detail: 'Periode locked hanya bisa dibuka ulang oleh BOD/Superadmin.', status: 'Restricted' },
];

function formatCurrency(value: number) {
  return `Rp ${value} jt`;
}

export default function TargetPage() {
  const totalTarget = outlets.reduce((sum, outlet) => sum + outlet.target, 0);
  const totalRealization = outlets.reduce((sum, outlet) => sum + outlet.realization, 0);
  const achievement = Math.round((totalRealization / totalTarget) * 1000) / 10;

  return (
    <div className="space-y-6">
      <section className="rounded-card border border-line bg-white p-5 shadow-card">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="text-sm font-medium text-primary">Target Planning</p>
            <h1 className="mt-1 text-2xl font-semibold text-navy">Target & Realisasi</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">Flow mock draft, submit, return, approve, dan lock target tanpa API/DB.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="rounded-input border border-line px-4 py-2 text-sm font-medium text-navy">Simpan Draft</button>
            <button type="button" className="rounded-input bg-primary px-4 py-2 text-sm font-medium text-white">Submit ke BOD</button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-card border border-line bg-white p-5 shadow-card">
          <p className="text-sm text-slate-500">Derived total target</p>
          <p className="mt-3 text-2xl font-semibold text-navy">{formatCurrency(totalTarget)}</p>
          <p className="mt-2 text-sm text-slate-500">Akumulasi outlet, bukan input manual divisi</p>
        </article>
        <article className="rounded-card border border-line bg-white p-5 shadow-card">
          <p className="text-sm text-slate-500">Realisasi</p>
          <p className="mt-3 text-2xl font-semibold text-success">{formatCurrency(totalRealization)}</p>
          <p className="mt-2 text-sm text-slate-500">Update mock periode berjalan</p>
        </article>
        <article className="rounded-card border border-line bg-white p-5 shadow-card">
          <p className="text-sm text-slate-500">Achievement</p>
          <p className="mt-3 text-2xl font-semibold text-primary">{achievement}%</p>
          <p className="mt-2 text-sm text-slate-500">Level A sementara</p>
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <article className="rounded-card border border-line bg-white p-5 shadow-card">
          <h2 className="text-lg font-semibold text-navy">Target per outlet</h2>
          <div className="mt-4 overflow-hidden rounded-card border border-line">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Outlet</th>
                  <th className="px-4 py-3 font-medium">Divisi</th>
                  <th className="px-4 py-3 font-medium">Target</th>
                  <th className="px-4 py-3 font-medium">Realisasi</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {outlets.map((outlet) => (
                  <tr key={outlet.outlet}>
                    <td className="px-4 py-3 font-medium text-navy">{outlet.outlet}</td>
                    <td className="px-4 py-3 text-slate-600">{outlet.division}</td>
                    <td className="px-4 py-3 text-slate-600">{formatCurrency(outlet.target)}</td>
                    <td className="px-4 py-3 text-slate-600">{formatCurrency(outlet.realization)}</td>
                    <td className="px-4 py-3"><StatusPill status={outlet.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="rounded-card border border-line bg-white p-5 shadow-card">
          <h2 className="text-lg font-semibold text-navy">Timeline status</h2>
          <div className="mt-4 space-y-3">
            {timeline.map((item) => (
              <div key={item.step} className="rounded-card border border-line p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-navy">{item.step}</p>
                  <StatusPill status={item.state} />
                </div>
                <p className="mt-1 text-sm text-slate-500">{item.detail}</p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="rounded-card border border-line bg-white p-5 shadow-card">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-navy">Approval queue</h2>
            <p className="text-sm text-slate-500">Mock antrian review BOD dan item returned</p>
          </div>
          <button type="button" className="rounded-input border border-line px-3 py-2 text-sm font-medium text-navy">Lihat Queue BOD</button>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {approvals.map((item) => (
            <article key={item.item} className="rounded-card border border-line p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="font-medium text-navy">{item.item}</p>
                <StatusPill status={item.status} />
              </div>
              <p className="mt-2 text-sm text-slate-500">{item.requester}</p>
              <p className="mt-1 text-sm text-slate-500">{item.age}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
        <article className="rounded-card border border-line bg-white p-5 shadow-card">
          <h2 className="text-lg font-semibold text-navy">BOD review detail</h2>
          <p className="text-sm text-slate-500">Approve/return action mock dengan catatan wajib untuk return.</p>
          <div className="mt-4 space-y-3">
            {bodQueue.map((item) => (
              <div key={item.request} className="rounded-card border border-line p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-navy">{item.request}</p>
                    <p className="mt-1 text-sm text-slate-500">{item.submitter} · {item.action}</p>
                  </div>
                  <StatusPill status={item.status} />
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-card border border-line bg-white p-5 shadow-card">
          <h2 className="text-lg font-semibold text-navy">Governance target</h2>
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
