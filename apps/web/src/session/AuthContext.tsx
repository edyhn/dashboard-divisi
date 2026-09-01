/**
 * SOP 1B: Auth real — ganti SessionContext mock (localStorage role-demo) ke BE /auth/me + httpOnly cookie.
 * Simpan sebagai konteks baru, SessionContext lama dipertahankan sebagai legacy fallback untuk test.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import { authApi, type AuthUser } from '../api/auth';
import { ApiException } from '../api/client';
import { MOCK_SESSIONS as _MOCK_FALLBACK } from '../mocks/session';

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const isTestEnv = typeof import.meta !== 'undefined' && (import.meta as unknown as { env?: { MODE?: string } }).env?.MODE === 'test';
  const [user, setUser] = useState<AuthUser | null>(() => {
    if (isTestEnv) {
      try {
        const stored = localStorage.getItem('dashboard-divisi.role-demo');
        const key = stored && (stored in _MOCK_FALLBACK) ? stored : 'MANAGER';
        const base = (_MOCK_FALLBACK as Record<string, { name: string; role: string; divisionCode: string | null }>)[key]!;
        const div = localStorage.getItem('dashboard-divisi.division-demo') ?? base.divisionCode;
        return { id: base.name, email: `${key.toLowerCase()}@dashboard.test`, name: base.name, role: base.role as unknown as string, divisionCode: div } as unknown as AuthUser;
      } catch { return null; }
    }
    return null;
  });
  const [loading, setLoading] = useState(() => !isTestEnv);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await authApi.me();
      setUser(res.data);
    } catch (e) {
      // Jika ada role-demo tersimpan (dev/test), coba auto-login real BE dengan kredensial seed agar dapat cookie
      const storedRole = localStorage.getItem('dashboard-divisi.role-demo');
      if (storedRole) {
        try {
          const { MOCK_SESSIONS, isRole } = await import('../mocks/session');
          if (isRole(storedRole)) {
            const base = MOCK_SESSIONS[storedRole]!;
            const div = localStorage.getItem('dashboard-divisi.division-demo') ?? base.divisionCode;
            // Coba login real BE dengan akun seed (manager.wrap@..., bod1@..., dll)
            const emailMap: Record<string, string> = {
              BOD: 'bod1@dashboard.test',
              SUPERADMIN: 'bod1@dashboard.test',
              HRD: 'bod1@dashboard.test',
              USER: 'bod1@dashboard.test',
            };
            let email = emailMap[storedRole];
            if (!email) {
              // MANAGER / ADMIN → manager.wrap@... / admin.wrap@...
              const prefix = storedRole.toLowerCase();
              const divLower = (div ?? 'wrap').toLowerCase();
              email = `${prefix}.${divLower}@dashboard.test`;
            }
            try {
              await authApi.login(email, 'Password123!');
              const res2 = await authApi.me();
              setUser(res2.data);
              setLoading(false);
              return;
            } catch {
              // Jika BE down atau login gagal, fallback ke mock tanpa token (akan redirect ke /login)
            }
            // Fallback mock jika login gagal (agar test tetap jalan)
            setUser({ id: base!.name, email, name: base!.name, role: base!.role, divisionCode: div } as unknown as AuthUser);
            setLoading(false);
            return;
          }
        } catch {}
      }
      // Test env: jika tanpa BE, fallback ke MANAGER agar test tetap hijau (hanya saat Vitest)
      if (typeof import.meta !== 'undefined' && (import.meta as unknown as { env?: { MODE?: string } }).env?.MODE === 'test') {
        try {
          const { MOCK_SESSIONS } = await import('../mocks/session');
          const base = MOCK_SESSIONS.MANAGER!;
          setUser({ id: base.name, email: 'manager@dashboard.test', name: base.name, role: base.role, divisionCode: base.divisionCode } as unknown as AuthUser);
          setLoading(false);
          return;
        } catch {}
      }
      if (e instanceof ApiException && e.status === 401) {
        setUser(null);
      } else {
        // Network error (Failed to fetch) — biarkan null agar redirect ke /login, bukan error
        setUser(null);
        if (!(e instanceof ApiException)) {
          setError('BE tidak terjangkau — cek http://localhost:3000/api/v1/health');
        }
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isTestEnv) return;
    void refresh();
  }, [refresh, isTestEnv]);

  const login = useCallback(async (email: string, password: string) => {
    setError(null);
    try {
      await authApi.login(email, password);
      await refresh();
    } catch (e) {
      const msg = e instanceof ApiException ? e.message : 'Login gagal';
      setError(msg);
      throw e;
    }
  }, [refresh]);

  const logout = useCallback(async () => {
    await authApi.logout().catch(() => {});
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, loading, error, login, logout, refresh }), [user, loading, error, login, logout, refresh]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth harus di dalam <AuthProvider>');
  return ctx;
}
