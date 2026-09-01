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
    <div className="space-y-6">
      <section className="rounded-card-lg border border-line bg-white p-5 shadow-card hover:shadow-card-hover transition-shadow">
        <p className="text-sm font-medium text-primary">Reporting Center</p>
        <h1 className="mt-1 text-2xl lg:text-3xl font-semibold text-navy">Laporan & Export</h1>
        <p className="mt-2 text-sm text-slate-500">Real BE — /reports/transactions & /reports/reconciliation (scope + capability:view:report).</p>
      </section>
      <section className="rounded-card-lg border border-line bg-white p-5 shadow-card hover:shadow-card-hover transition-shadow">
        <h2 className="text-lg font-semibold text-navy">Katalog laporan</h2>
        <p className="text-sm text-slate-500">Payroll Summary — BOD only (guarded).</p>
        <div className="mt-2 text-sm text-slate-600"><p>Payroll Summary</p><p>Payroll Summary</p></div>
      </section>
      <section className="rounded-card-lg border border-line bg-white p-5 shadow-card hover:shadow-card-hover transition-shadow">
        <h2 className="text-lg font-semibold text-navy">Transaksi</h2>
        {(() => {
          if (tx.isLoading) return <LoadingState />;
          if (tx.error) {
            const e = tx.error as unknown as { message?: string; traceId?: string };
            return <ErrorState description={e.message ?? 'Gagal memuat transaksi'} traceId={e.traceId} onRetry={() => void tx.refetch()} />;
          }
          if (!tx.data || (Array.isArray(tx.data) && (tx.data as unknown[]).length === 0)) return <EmptyState description="Belum ada transaksi untuk filter ini." />;
          return <pre className="mt-3 max-h-64 overflow-auto rounded bg-surface p-3 text-xs">{JSON.stringify(tx.data, null, 2)}</pre>;
        })()}
      </section>
      <section className="rounded-card-lg border border-line bg-white p-5 shadow-card hover:shadow-card-hover transition-shadow">
        <h2 className="text-lg font-semibold text-navy">Rekonsiliasi</h2>
        {(() => {
          if (recon.isLoading) return <LoadingState />;
          if (recon.error) {
            const e = recon.error as unknown as { message?: string; traceId?: string };
            return <ErrorState description={e.message ?? 'Gagal memuat rekonsiliasi'} traceId={e.traceId} onRetry={() => void recon.refetch()} />;
          }
          if (!recon.data) return <EmptyState />;
          return <pre className="mt-3 max-h-64 overflow-auto rounded bg-surface p-3 text-xs">{JSON.stringify(recon.data, null, 2)}</pre>;
        })()}
      </section>
      <section className="rounded-card-lg border border-line bg-white p-5 shadow-card hover:shadow-card-hover transition-shadow">
        <h2 className="text-lg font-semibold text-navy">Access guardrail</h2>
        <p className="text-sm text-slate-500">Export lintas divisi guard oleh capability:view:report + scope.</p>
      </section>
    </div>
  );
}
