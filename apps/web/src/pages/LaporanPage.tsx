import { useQuery } from '@tanstack/react-query';
import { revenueApi } from '../api/revenue';
import { EmptyState, ErrorState, LoadingState } from '../components/states';
import { useOrgFilters } from '../components/filters/OrgFilters';

export default function LaporanPage() {
  const { divisionCode, periodFrom, periodTo } = useOrgFilters();
  const params = { divisionCode: divisionCode || undefined, from: periodFrom || undefined, to: periodTo || undefined } as Record<string, string | undefined>;
  const tx = useQuery({ queryKey: ['reports','transactions',params], queryFn: () => revenueApi.transactions(params).then(r=>r.data) });
  const recon = useQuery({ queryKey: ['reports','reconciliation',params], queryFn: () => revenueApi.reconciliation(params).then(r=>r.data) });

  return (
    <div className="space-y-6 animate-fade-in-up">
      <section className="rounded-card-lg border border-line/40 bg-white/70 backdrop-blur-md p-6 shadow-sm hover:shadow-lg transition-all duration-300">
        <p className="text-sm font-medium text-primary">Reporting Center</p>
        <h1 className="mt-1 text-2xl lg:text-3xl font-bold tracking-tight text-navy">Laporan & Export</h1>
        <p className="mt-2 text-sm text-slate-500">Real BE — /reports/transactions & /reports/reconciliation (scope + capability:view:report).</p>
      </section>
      <section className="rounded-card-lg border border-line/40 bg-white/70 backdrop-blur-md p-6 shadow-sm hover:shadow-lg transition-all duration-300">
        <h2 className="text-lg font-semibold text-navy">Katalog laporan</h2>
        <div className="mt-3 flex items-center justify-between rounded-card-lg border border-line/40 p-4">
          <div><p className="font-medium text-navy">Payroll Summary</p><p className="text-sm text-slate-500">BOD only — guarded `view:report` + scope</p></div>
          <span className="rounded-pill bg-primary-light px-3 py-1 text-xs font-medium text-primary border border-primary/20">Restricted</span>
        </div>
      </section>
      <section className="rounded-card-lg border border-line/40 bg-white/70 backdrop-blur-md p-6 shadow-sm hover:shadow-lg transition-all duration-300">
        <h2 className="text-lg font-semibold text-navy">Transaksi</h2>
        {(() => {
          if (tx.isLoading) return <LoadingState />;
          if (tx.error) {
            const e = tx.error as unknown as { message?: string; traceId?: string };
            return <ErrorState description={e.message ?? 'Gagal memuat transaksi'} traceId={e.traceId} onRetry={() => void tx.refetch()} />;
          }
          const d = tx.data as unknown as { byMethod?: { method: string; amount: string; transactionCount: number; sharePercent?: number | null }[] } | null;
          const rows = d?.byMethod ?? [];
          if (rows.length === 0) return <EmptyState description="Belum ada transaksi untuk filter ini." />;
          return (
            <div className="mt-4 overflow-x-auto rounded-card-lg border border-line/40">
              <table className="min-w-[520px] w-full text-left text-sm">
                <caption className="sr-only">Transaksi per metode</caption>
                <thead className="bg-surface text-slate-500"><tr><th scope="col" className="px-4 py-3">Metode</th><th scope="col" className="px-4 py-3">Nominal</th><th scope="col" className="px-4 py-3">Transaksi</th><th scope="col" className="px-4 py-3">Share</th></tr></thead>
                <tbody className="divide-y divide-line/40">{rows.map((r) => <tr key={r.method}><td className="px-4 py-3 font-medium text-navy">{r.method}</td><td className="px-4 py-3 font-mono text-xs">Rp {r.amount}</td><td className="px-4 py-3">{r.transactionCount}</td><td className="px-4 py-3">{r.sharePercent != null ? `${r.sharePercent}%` : '—'}</td></tr>)}</tbody>
              </table>
            </div>
          );
        })()}
        <p className="mt-2 text-xs text-slate-400 lg:hidden">Geser → untuk lihat kolom</p>
      </section>
      <section className="rounded-card-lg border border-line/40 bg-white/70 backdrop-blur-md p-6 shadow-sm hover:shadow-lg transition-all duration-300">
        <h2 className="text-lg font-semibold text-navy">Rekonsiliasi</h2>
        {(() => {
          if (recon.isLoading) return <LoadingState />;
          if (recon.error) {
            const e = recon.error as unknown as { message?: string; traceId?: string };
            return <ErrorState description={e.message ?? 'Gagal memuat rekonsiliasi'} traceId={e.traceId} onRetry={() => void recon.refetch()} />;
          }
          const d = recon.data as unknown as { totals?: { cashierAmount?: string; bankAmount?: string; variance?: string } } | null;
          if (!d?.totals) return <EmptyState description="Belum ada data rekonsiliasi." />;
          const t = d.totals;
          return (
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              <div className="rounded-card-lg border border-line/40 p-4"><p className="text-xs uppercase tracking-wider text-slate-400">Kasir</p><p className="mt-1 font-mono text-sm font-semibold text-navy">Rp {t.cashierAmount ?? '0'}</p></div>
              <div className="rounded-card-lg border border-line/40 p-4"><p className="text-xs uppercase tracking-wider text-slate-400">Bank</p><p className="mt-1 font-mono text-sm font-semibold text-navy">Rp {t.bankAmount ?? '0'}</p></div>
              <div className={`rounded-card-lg border p-4 ${t.variance && t.variance !== '0.00' ? 'border-warning/30 bg-warning-light/40' : 'border-success/20 bg-success-light/30'}`}><p className="text-xs uppercase tracking-wider text-slate-400">Variance</p><p className="mt-1 font-mono text-sm font-semibold">Rp {t.variance ?? '0'}</p></div>
            </div>
          );
        })()}
      </section>
      <section className="rounded-card-lg border border-line/40 bg-white/70 backdrop-blur-md p-6 shadow-sm hover:shadow-lg transition-all duration-300">
        <h2 className="text-lg font-semibold text-navy">Access guardrail</h2>
        <p className="text-sm text-slate-500">Export lintas divisi guard oleh capability:view:report + scope.</p>
      </section>
    </div>
  );
}
