import { useState } from 'react';
import { StatusPill } from '../components/StatusPill';
import { EmptyState, ErrorState, LoadingState } from '../components/states';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useToast } from '../components/ui/Toast';
import { useTargetsCurrent, useTargetsRunRate, useUpsertTarget } from '../hooks/useTargets';
import { useOrgFilters } from '../components/filters/OrgFilters';

export default function TargetPage() {
  const { divisionCode } = useOrgFilters();
  const { data, isLoading, error, refetch } = useTargetsCurrent(divisionCode ? { divisionCode } : undefined);
  const runRate = useTargetsRunRate(divisionCode ? { divisionCode } : undefined);
  const upsert = useUpsertTarget();
  const [amount, setAmount] = useState('100');
  const [periodMonth, setPeriodMonth] = useState(new Date().toISOString().slice(0, 7));
  const [outletId, setOutletId] = useState('');

  if (isLoading) return <LoadingState label="Memuat target..." />;
  if (error) {
    const e = error as unknown as { message?: string; traceId?: string };
    return <ErrorState description={e.message ?? 'Gagal memuat target'} traceId={e.traceId} onRetry={() => void refetch()} />;
  }

  const list = Array.isArray(data) ? data as unknown as { id: string; outlet_id: string; amount: number; status: string; period_month: string }[] : [];

  const { toast } = useToast();
  const handleSubmit = async () => {
    if (!outletId) return;
    try {
      await upsert.mutateAsync({ outletId, periodMonth, amount: Number(amount), action: 'draft' });
      toast('Draft tersimpan', 'success');
      void refetch();
    } catch (e) {
      const err = e as unknown as { message?: string; traceId?: string };
      toast(`${err.message ?? 'Gagal simpan'}${err.traceId ? ` — ${err.traceId}` : ''}`, 'error');
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-card-lg border border-line bg-white p-5 shadow-card hover:shadow-card-hover transition-shadow">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="text-sm font-medium text-primary">Target Planning</p>
            <h1 className="mt-1 text-2xl lg:text-3xl font-semibold text-navy">Target & Realisasi</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">Terhubung BE real — /targets/current-month & upsert tenant target (FormRequest).</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Input value={outletId} onChange={(e) => setOutletId(e.target.value)} placeholder="outletId (uuid)" aria-label="Outlet ID" />
            <Input value={periodMonth} onChange={(e) => setPeriodMonth(e.target.value)} aria-label="Periode" />
            <Input value={amount} onChange={(e) => setAmount(e.target.value)} className="w-24" aria-label="Amount" />
            <Button onClick={handleSubmit} disabled={upsert.isPending}>Simpan Draft (BE)</Button>
          </div>
        </div>
        {upsert.isError && <p className="mt-2 text-sm text-danger">{(upsert.error as Error).message}</p>}
        {upsert.isSuccess && <p className="mt-2 text-sm text-success">Draft tersimpan</p>}
      </section>

      {list.length === 0 ? <EmptyState title="Belum ada target" description="Buat target per outlet — data akan muncul dari /targets/current-month (scope divisi)." /> : (
        <section className="rounded-card-lg border border-line bg-white p-5 shadow-card hover:shadow-card-hover transition-shadow">
          <h2 className="text-lg font-semibold text-navy">Target per outlet (real)</h2>
          <div className="mt-4 overflow-x-auto rounded-card-lg border border-line">
            <table className="min-w-[720px] w-full text-left text-sm">
              <thead className="bg-surface text-slate-500">
                <tr><th scope="col" className="px-4 py-3 font-medium">ID</th><th scope="col" className="px-4 py-3 font-medium">Periode</th><th scope="col" className="px-4 py-3 font-medium">Amount</th><th scope="col" className="px-4 py-3 font-medium">Status</th></tr>
              </thead>
              <tbody className="divide-y divide-line">
                {list.map((r) => (
                  <tr key={r.id}><td className="px-4 py-3 font-medium text-navy">{r.id.slice(0, 8)}</td><td className="px-4 py-3 text-slate-600">{r.period_month}</td><td className="px-4 py-3 text-slate-600">{r.amount}</td><td className="px-4 py-3"><StatusPill status={r.status} /></td></tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-slate-400 lg:hidden">Geser → untuk lihat kolom</p>
        </section>
      )}

      <section className="rounded-card-lg border border-line bg-white p-5 shadow-card hover:shadow-card-hover transition-shadow">
        <h2 className="text-lg font-semibold text-navy">Run-rate (sisa harian)</h2>
        {runRate.isLoading ? <p className="text-sm text-slate-500">Memuat run-rate...</p> : runRate.error ? <p className="text-sm text-danger">{(runRate.error as Error).message}</p> : <pre className="mt-2 max-h-32 overflow-auto rounded bg-surface p-3 text-xs">{JSON.stringify(runRate.data, null, 2)}</pre>}
        <p className="mt-2 text-xs text-slate-400">Scope {divisionCode ?? 'semua'} · MANAGER 1:1, BOD lintas</p>
      </section>
      <section className="rounded-card-lg border border-line bg-white p-5 shadow-card hover:shadow-card-hover transition-shadow">
        <h2 className="text-lg font-semibold text-navy">BOD review detail</h2>
        <p className="text-sm text-slate-500">Approve/return detail — real via /targets/{'{id}'}/approve.</p>
      </section>
      <section className="rounded-card-lg border border-line bg-white p-5 shadow-card hover:shadow-card-hover transition-shadow">
        <h2 className="text-lg font-semibold text-navy">Governance target</h2>
        <p className="text-sm text-slate-500">Tetap ditampilkan sebagai SOP — bukan mock data.</p>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <div className="rounded-card-lg border border-line p-4"><p className="font-medium text-navy">Segregation of duties</p><p className="text-sm text-slate-500">Pembuat tidak bisa approve</p><div className="mt-2"><StatusPill status="Enforced" /></div></div>
          <div className="rounded-card-lg border border-line p-4"><p className="font-medium text-navy">Append-only approval</p><p className="text-sm text-slate-500">Event baru, bukan update diam</p><div className="mt-2"><StatusPill status="Audit" /></div></div>
          <div className="rounded-card-lg border border-line p-4"><p className="font-medium text-navy">Privileged reopen</p><p className="text-sm text-slate-500">Hanya BOD</p><div className="mt-2"><StatusPill status="Restricted" /></div></div>
        </div>
      </section>
    </div>
  );
}
