import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { api } from '../api/client';
import { useDivisionConfigs, useOutlets } from '../hooks/useBod';
import { useToast } from '../components/ui/Toast';
import { EmptyState, ErrorState, LoadingState } from '../components/states';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { StatusPill } from '../components/StatusPill';

export default function KonfigurasiPage() {
  const { data, isLoading, error, refetch } = useDivisionConfigs();
  const outletQ = useOutlets();
  const { toast } = useToast();
  const [code, setCode] = useState('WRAP');
  const [modules, setModules] = useState('dashboard,revenue');
  const [kpis, setKpis] = useState('revenue.gross');
  const mut = useMutation({
    mutationFn: () => api.post<unknown>(`/division-configs/${code}`, { enabledModules: modules.split(',').map(s => s.trim()).filter(Boolean), enabledKpis: kpis.split(',').map(s => s.trim()).filter(Boolean) }).then((r) => r.data),
    onSuccess: () => { toast('Config disimpan', 'success'); void refetch(); },
    onError: () => { const err = mut.error as unknown as { message?: string; traceId?: string }; toast(`${err.message ?? 'Gagal simpan'}${err.traceId ? ` — ${err.traceId}` : ''}`, 'error'); }
  });

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState description={(error as Error).message} onRetry={()=>void refetch()} />;
  if (!data) return <EmptyState />;

  return (
    <div className="space-y-6 animate-fade-in-up">
      <section className="rounded-card-lg border border-line/40 bg-white/70 backdrop-blur-md p-6 shadow-sm hover:shadow-lg transition-all duration-300">
        <p className="text-sm font-medium text-primary">Admin Config</p>
        <h1 className="mt-1 text-2xl lg:text-3xl font-bold tracking-tight text-navy">Konfigurasi Divisi & Outlet</h1>
        <p className="mt-2 text-sm text-slate-500">Real BE — GET /division-configs & POST /division-configs/{'{divisionCode}'} (capability:manage:division).</p>
      </section>

      <section className="rounded-card-lg border border-line/40 bg-white/70 backdrop-blur-md p-6 shadow-sm hover:shadow-lg transition-all duration-300">
        <h2 className="text-lg font-semibold text-navy">Divisi</h2>
        <p className="text-sm text-slate-500">Money Changer guard</p>
        <div className="mt-4 overflow-x-auto rounded-card-lg border border-line/40">
          <table className="min-w-[720px] w-full text-left text-sm">
            <thead className="bg-surface text-slate-500"><tr><th scope="col" className="px-4 py-3">Kode</th><th scope="col" className="px-4 py-3">Modules</th><th scope="col" className="px-4 py-3">KPIs</th><th scope="col" className="px-4 py-3">Aktif</th></tr></thead>
            <tbody className="divide-y divide-line/40">{(data as unknown as {divisionCode:string; enabledModules:string[]; enabledKpis:string[]; isActive:boolean}[]).map(d=> <tr key={d.divisionCode}><td className="px-4 py-3 font-medium text-navy">{d.divisionCode}</td><td className="px-4 py-3 text-slate-600">{d.enabledModules.join(', ')}</td><td className="px-4 py-3 text-slate-600">{d.enabledKpis.join(', ')}</td><td className="px-4 py-3"><StatusPill status={d.isActive?'Aktif':'Nonaktif'} /></td></tr>)}</tbody>
          </table>
          </div>
          <p className="mt-2 text-xs text-slate-400 lg:hidden">Geser → untuk lihat kolom</p>
      </section>

      <section className="rounded-card-lg border border-line/40 bg-white/70 backdrop-blur-md p-6 shadow-sm hover:shadow-lg transition-all duration-300">
        <h2 className="text-lg font-semibold text-navy">Outlet</h2>
        <p className="text-sm text-slate-500">Real BE — GET /org/outlets scoped per role/divisi (BOD lihat semua 7 divisi, MANAGER/ADMIN 1:1).</p>
        {outletQ.isLoading ? <p className="mt-3 text-sm text-slate-500">Memuat outlet...</p> : outletQ.error ? <ErrorState description={(outletQ.error as Error).message} onRetry={()=> void outletQ.refetch()} /> : (()=> {
          const rows = (outletQ.data ?? []) as unknown as { code:string; name:string; divisionId:string; isActive:boolean }[];
          if (rows.length===0) return <EmptyState title="Belum ada outlet" description="Seed outlet belum tersedia — jalankan php artisan db:seed" />;
          return (
            <>
              <div className="mt-4 overflow-x-auto rounded-card-lg border border-line/40">
                <table className="min-w-[520px] w-full text-left text-sm">
                  <caption className="sr-only">Outlet per divisi</caption>
                  <thead className="bg-surface text-slate-500"><tr><th scope="col" className="px-4 py-3">Kode</th><th scope="col" className="px-4 py-3">Nama</th><th scope="col" className="px-4 py-3">Aktif</th></tr></thead>
                  <tbody className="divide-y divide-line/40">{rows.slice(0,20).map(o=> <tr key={o.code}><td className="px-4 py-3 font-medium text-navy">{o.code}</td><td className="px-4 py-3 text-slate-600">{o.name}</td><td className="px-4 py-3"><StatusPill status={o.isActive ? 'Aktif' : 'Nonaktif'} /></td></tr>)}</tbody>
                </table>
              </div>
              <p className="mt-2 text-xs text-slate-400 lg:hidden">Geser → untuk lihat kolom</p>
              <p className="mt-2 text-xs text-slate-400">{rows.length} outlet terlihat (scope {rows.length>7 ? 'BOD lintas' : '1:1'})</p>
            </>
          );
        })()}
      </section>

      <section className="rounded-card-lg border border-line/40 bg-white/70 backdrop-blur-md p-6 shadow-sm hover:shadow-lg transition-all duration-300">
        <h2 className="text-lg font-semibold text-navy">Upsert Config (BE real)</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <Input value={code} onChange={e=>setCode(e.target.value)} className="w-24" placeholder="WRAP" aria-label="Kode divisi" />
          <Input value={modules} onChange={e=>setModules(e.target.value)} className="flex-1" placeholder="dashboard,revenue" aria-label="Modules" />
          <Input value={kpis} onChange={e=>setKpis(e.target.value)} className="flex-1" placeholder="revenue.gross" aria-label="KPIs" />
          <Button onClick={()=>mut.mutate()} disabled={mut.isPending}>Simpan</Button>
        </div>
        {mut.isError && <p className="mt-2 text-sm text-danger">{(mut.error as Error).message}</p>}
        {mut.isSuccess && <p className="mt-2 text-sm text-success">Tersimpan</p>}
      </section>
    </div>
  );
}
