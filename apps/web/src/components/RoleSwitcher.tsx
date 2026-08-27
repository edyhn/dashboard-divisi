import { ROLES } from '../mocks/session';
import type { Role } from '../mocks/session';
import { useSession } from '../session/SessionContext';

export function RoleSwitcher() {
  const { user, setRole } = useSession();

  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-slate-500">Lihat sebagai</span>
      <select
        value={user.role}
        onChange={(event) => setRole(event.target.value as Role)}
        className="rounded-input border border-line bg-white px-2 py-1"
      >
        {ROLES.map((role) => (
          <option key={role} value={role}>
            {role}
          </option>
        ))}
      </select>
    </label>
  );
}