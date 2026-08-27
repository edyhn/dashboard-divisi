import { ROLES } from '../mocks/session';
import type { Role } from '../mocks/session';
import { useSession } from '../session/SessionContext';

const DIVISIONS = ['WRAP', 'CELL', 'REFL', 'MINI', 'FNB', 'FIN', 'MC'] as const;

export function RoleSwitcher() {
  const { user, setRole, setDivisionCode } = useSession();

  return (
    <div className="flex items-center gap-2 text-sm">
      <label className="flex items-center gap-2">
        <span className="text-slate-500">Lihat sebagai</span>
        <select
          value={user.role}
          onChange={(event) => setRole(event.target.value as Role)}
          className="rounded-input border border-line bg-white px-2 py-1"
          data-testid="role-switcher"
        >
          {ROLES.map((role) => (
            <option key={role} value={role}>
              {role}
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
            {DIVISIONS.map((code) => (
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