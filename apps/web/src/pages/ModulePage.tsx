type Stat = {
  label: string;
  value: string;
  note: string;
};

type Row = Record<string, string>;

interface ModulePageProps {
  eyebrow: string;
  title: string;
  description: string;
  primaryAction: string;
  stats: Stat[];
  rows: Row[];
}

export function ModulePage({ eyebrow, title, description, primaryAction, stats, rows }: ModulePageProps) {
  const columns = rows[0] ? Object.keys(rows[0]) : [];

  return (
    <div className="space-y-6">
      <section className="rounded-card border border-line bg-white p-5 shadow-card">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-medium text-primary">{eyebrow}</p>
            <h1 className="mt-1 text-2xl font-semibold text-navy">{title}</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">{description}</p>
          </div>
          <button type="button" className="rounded-input bg-primary px-4 py-2 text-sm font-medium text-white">
            {primaryAction}
          </button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <article key={stat.label} className="rounded-card border border-line bg-white p-5 shadow-card">
            <p className="text-sm text-slate-500">{stat.label}</p>
            <p className="mt-3 text-2xl font-semibold text-navy">{stat.value}</p>
            <p className="mt-2 text-sm text-slate-500">{stat.note}</p>
          </article>
        ))}
      </section>

      <section className="rounded-card border border-line bg-white p-5 shadow-card">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-navy">Daftar mock</h2>
            <p className="text-sm text-slate-500">Data lokal sementara untuk validasi UI</p>
          </div>
          <span className="rounded-input bg-surface px-3 py-1 text-sm text-slate-500">Mock</span>
        </div>
        <div className="mt-4 overflow-x-auto rounded-card border border-line">
          <table className="min-w-[640px] w-full text-left text-sm">
            <thead className="bg-surface text-slate-500">
              <tr>
                {columns.map((column) => (
                  <th key={column} className="px-4 py-3 font-medium">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((row, index) => (
                <tr key={index}>
                  {columns.map((column, columnIndex) => (
                    <td key={column} className={columnIndex === 0 ? 'px-4 py-3 font-medium text-navy' : 'px-4 py-3 text-slate-600'}>
                      {row[column]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
