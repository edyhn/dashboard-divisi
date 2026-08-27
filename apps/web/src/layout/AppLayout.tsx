import { NavLink, Outlet } from 'react-router-dom';

import { MENU_ITEMS } from '../mocks/session';
import { useSession } from '../session/SessionContext';
import { hasCapability } from '../session/capability';
import { RoleSwitcher } from '../components/RoleSwitcher';

export function AppLayout() {
  const { user } = useSession();

  const visibleMenu = MENU_ITEMS.filter((item) => {
    if (!item.roles.includes(user.role)) return false;
    if (item.capability && !hasCapability(user.role, item.capability)) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-surface">
      <aside className="fixed inset-y-0 left-0 w-60 bg-navy px-4 py-5 text-slate-200">
        <div className="mb-6 px-2 text-lg font-semibold text-white">
          Dashboard Divisi
        </div>
        <nav className="flex flex-col gap-1">
          {visibleMenu.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                isActive
                  ? 'rounded-card bg-primary px-3 py-2 text-sm font-medium text-white'
                  : 'rounded-card px-3 py-2 text-sm hover:bg-white/10'
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="ml-60 flex min-h-screen flex-col">
        <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-line bg-white px-6">
          <span className="text-sm text-slate-500">Shell FND-04</span>
          <div className="flex items-center gap-4">
            <RoleSwitcher />
            <span className="text-sm font-medium">{user.name}</span>
          </div>
        </header>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
