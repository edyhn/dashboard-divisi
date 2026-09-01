import { useQuery } from '@tanstack/react-query';
import { orgApi } from '../api/org';
import { EmptyState, ErrorState, LoadingState } from '../components/states';
import { useToast } from '../components/ui/Toast';

export default function WorkforcePage() {
  const ctx = useQuery({ queryKey:['org','context'], queryFn:()=>orgApi.context().then(r=>r.data)});
  const { toast } = useToast();
  if (ctx.isLoading) return <LoadingState />;
  if (ctx.error) {
    const err = ctx.error as unknown as { message?: string; traceId?: string };
    toast(`${err.message ?? 'Gagal muat context'}${err.traceId ? ` — ${err.traceId}` : ''}`, 'error');
    return <ErrorState description={err.message ?? 'Gagal muat context'} traceId={err.traceId} onRetry={()=>void ctx.refetch()} />;
  }
  if (!ctx.data) return <EmptyState />;
  const data = ctx.data as unknown as { user: {role:string; divisionCode:string|null}; divisions:{code:string;name:string}[]; outlets:{code:string;name:string}[]; scope:string };
  return (
    <div className="space-y-6">
      <section className="rounded-card-lg border border-line bg-white p-5 shadow-card hover:shadow-card-hover transition-shadow">
        <p className="text-sm font-medium text-primary">Workforce</p>
        <h1 className="mt-1 text-2xl lg:text-3xl font-semibold text-navy">Kehadiran, Cuti, Lembur</h1>
        <p className="mt-2 text-sm text-slate-500">Real BE — /org/me/context (scope: {data.scope}) — Privacy guard aktif. Payroll guarded.</p>
        <button className="mt-3 rounded-input border border-line px-3 py-2 text-sm">Import SobatHR</button>
        <p className="mt-2 text-sm text-slate-500">Privacy guard</p>
        <p className="mt-1 text-sm text-slate-500">Payroll</p>
      </section>
      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-card-lg border border-line bg-white p-5 shadow-card hover:shadow-card-hover transition-shadow"><p className="text-sm text-slate-500">Divisi terlihat</p><p className="mt-2 text-2xl lg:text-3xl font-semibold text-navy">{data.divisions.length}</p></div>
        <div className="rounded-card-lg border border-line bg-white p-5 shadow-card hover:shadow-card-hover transition-shadow"><p className="text-sm text-slate-500">Outlet terlihat</p><p className="mt-2 text-2xl lg:text-3xl font-semibold text-navy">{data.outlets.length}</p></div>
        <div className="rounded-card-lg border border-line bg-white p-5 shadow-card hover:shadow-card-hover transition-shadow"><p className="text-sm text-slate-500">Scope</p><p className="mt-2 text-sm font-semibold text-navy">{data.scope}</p></div>
      </section>
      <section className="rounded-card-lg border border-line bg-white p-5 shadow-card hover:shadow-card-hover transition-shadow">
        <h2 className="text-lg font-semibold text-navy">Konteks real</h2>
        <pre className="mt-3 max-h-64 overflow-auto rounded bg-surface p-3 text-xs">{JSON.stringify(ctx.data,null,2)}</pre>
      </section>
    </div>
  );
}
