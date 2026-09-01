import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../session/AuthContext';

export default function LoginPage() {
  const { login, error } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('bod1@dashboard.test');
  const [password, setPassword] = useState('Password123!');
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
    <div className="flex min-h-screen items-center justify-center bg-surface p-4">
      <form onSubmit={submit} className="w-full max-w-sm rounded-card-lg border border-line bg-white p-6 shadow-card">
        <h1 className="text-xl font-semibold text-navy">Masuk Dashboard Divisi</h1>
        <p className="mt-1 text-sm text-slate-500">Gunakan akun 17 akun seed (BOD/Manager/Admin)</p>
        <label htmlFor="login-email" className="mt-4 flex flex-col text-sm">
          Email
          <Input id="login-email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1" placeholder="bod1@dashboard.test" autoComplete="email" aria-invalid={!!(msg ?? error)} aria-describedby={msg ?? error ? "login-error" : undefined} />
        </label>
        <label htmlFor="login-password" className="mt-3 flex flex-col text-sm">
          Password
          <Input id="login-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1" autoComplete="current-password" aria-invalid={!!(msg ?? error)} aria-describedby={msg ?? error ? "login-error" : undefined} />
        </label>
        {(msg ?? error) && <p id="login-error" role="alert" className="mt-3 text-sm text-danger">{msg ?? error}</p>}
        <Button disabled={loading} className="mt-4 w-full">
          {loading ? 'Memproses...' : 'Masuk'}
        </Button>
        <p className="mt-3 text-xs text-slate-400">BE: httpOnly cookie access_token + trace_id di header</p>
      </form>
    </div>
  );
}
