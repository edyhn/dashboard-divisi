import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard } from 'lucide-react';

import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../session/AuthContext';

export default function LoginPage() {
  const { login, error } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    try {
      await login(email, password);
      nav('/dashboard', { replace: true });
    } catch (err) {
      setMsg(err instanceof Error ? err.message : 'Login gagal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-mesh p-4 animate-fade-in relative overflow-hidden">
      {/* Decorative blurry circles in the background */}
      <div className="absolute top-1/4 left-1/4 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-[80px]" />
      <div className="absolute bottom-1/4 right-1/4 h-64 w-64 translate-x-1/2 translate-y-1/2 rounded-full bg-info/20 blur-[80px]" />

      <form onSubmit={submit} className="relative w-full max-w-sm rounded-card-lg glass p-8 animate-fade-in-up">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20">
            <LayoutDashboard className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-navy">Dashboard Divisi</h1>
          <p className="mt-2 text-sm text-slate-500">Silakan masuk ke akun Anda</p>
        </div>

        <label htmlFor="login-email" className="flex flex-col text-sm font-medium text-slate-700">
          Email
          <Input id="login-email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5" placeholder="nama@divisi.company.id" autoComplete="email" aria-invalid={!!(msg ?? error)} aria-describedby={msg ?? error ? "login-error" : undefined} />
        </label>
        
        <label htmlFor="login-password" className="mt-4 flex flex-col text-sm font-medium text-slate-700">
          Password
          <Input id="login-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1.5" autoComplete="current-password" aria-invalid={!!(msg ?? error)} aria-describedby={msg ?? error ? "login-error" : undefined} />
        </label>
        {(msg ?? error) && <p id="login-error" role="alert" className="mt-4 rounded-md bg-danger-light/50 p-2.5 text-center text-sm font-medium text-danger">{msg ?? error}</p>}
        
        <Button disabled={loading} className="mt-6 w-full py-2.5 text-base">
          {loading ? 'Memproses...' : 'Masuk'}
        </Button>
        
        <p className="mt-6 text-center text-xs text-slate-400">BE: httpOnly cookie access_token + trace_id di header</p>
      </form>
    </div>
  );
}
