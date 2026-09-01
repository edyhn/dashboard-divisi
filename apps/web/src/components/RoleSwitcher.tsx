import { DIVISION_CODES } from '../config/divisions';
import { ROLES, roleDisplay } from '../mocks/session';
import type { Role } from '../mocks/session';
import { useSession } from '../session/SessionContext';
import { useAuth } from '../session/AuthContext';
import { authApi } from '../api/auth';

export function RoleSwitcher() {
  // SOP: RoleSwitcher hanya untuk preview dev/demo tanpa BE login; di prod sembunyikan (SOP: Zero mock di prod)
  const isDev = typeof import.meta !== 'undefined' && (import.meta as unknown as { env?: { MODE?: string; DEV?: boolean } }).env?.DEV;
  const isTestEnv = typeof import.meta !== 'undefined' && (import.meta as unknown as { env?: { MODE?: string } }).env?.MODE === 'test';
  if (!isDev && !isTestEnv) return null;
  const { user, setRole, setDivisionCode } = useSession();
  const { refresh } = (() => { try { return useAuth(); } catch { return { refresh: async () => {} } as never; } })();

  const handleRoleChange = async (next: Role) => {
    setRole(next);
    // Hybrid: coba login real BE dengan seed agar cookie sync (best-effort, tetap mock jika BE down)
    try {
      const base = (await import('../mocks/session')).MOCK_SESSIONS[next]!;
      const div = base.divisionCode ?? 'WRAP';
      const email = next === 'BOD' ? 'bod1@dashboard.test' : `${next.toLowerCase()}.${div.toLowerCase()}@dashboard.test`;
      await authApi.login(email, 'Password123!').catch(() => {});
      await refresh().catch(() => {});
    } catch {}
  };

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="rounded-pill bg-warning-light border border-warning/20 px-2 py-1 text-xs font-medium text-warning">Demo preview — dev only</span>
      <label className="flex items-center gap-2">
        <span className="text-slate-500">Lihat sebagai</span>
        <select
          value={user.role}
          onChange={(event) => void handleRoleChange(event.target.value as Role)}
          className="rounded-input border border-line bg-white px-2 py-1"
          data-testid="role-switcher"
        >
          {ROLES.map((role) => (
            <option key={role} value={role}>
              {roleDisplay(role)} ({role})
            </option>
          ))}
        </select>
      </label>
      {(user.role === 'MANAGER' || user.role === 'ADMIN') && (
        <label className="flex items-center gap-2">
          <span className="text-slate-500">Divisi</span>
          <select
            value={user.divisionCode ?? ''}
            onChange={(e) => setDivisionCode(e.target.value || null)}
            className="rounded-input border border-line bg-white px-2 py-1"
            data-testid="division-switcher"
          >
            {DIVISION_CODES.map((code) => (
              <option key={code} value={code}>
                {code}
              </option>
            ))}
          </select>
        </label>
      )}
    </div>
  );
}