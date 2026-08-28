import { NavLink, Outlet, useLocation } from 'react-router-dom';

import { MENU_ITEMS } from '../mocks/session';
import { useSession } from '../session/SessionContext';
import { hasCapability } from '../session/capability';
import { RoleSwitcher } from '../components/RoleSwitcher';

export function AppLayout() {
  const { user } = useSession();
  const location = useLocation();

  const activeMenu = MENU_ITEMS.find((item) => item.path === location.pathname);
  const scopeLabel = user.divisionCode ?? 'Semua divisi';

  const visibleMenu = MENU_ITEMS.filter((item) => {
    if (!item.roles.includes(user.role)) return false;
    if (item.capability && !hasCapability(user.role, item.capability)) return false;
    return true;
  });

  const renderMenu = (variant: 'sidebar' | 'mobile') => (
    <nav className={variant === 'sidebar' ? 'flex flex-col gap-1' : 'flex gap-2 overflow-x-auto pb-2'} aria-label={variant === 'sidebar' ? 'Navigasi utama' : 'Navigasi mobile'}>
      {visibleMenu.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            isActive
              ? 'shrink-0 rounded-card bg-primary px-3 py-2 text-sm font-medium text-white'
              : 'shrink-0 rounded-card px-3 py-2 text-sm hover:bg-white/10 lg:hover:bg-navy/5'
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-surface">
      <aside className="fixed inset-y-0 left-0 hidden w-60 bg-navy px-4 py-5 text-slate-200 lg:block">
        <div className="mb-6 px-2 text-lg font-semibold text-white">Dashboard Divisi</div>
        {renderMenu('sidebar')}
      </aside>

      <div className="flex min-h-screen flex-col lg:ml-60">
        <header className="sticky top-0 z-40 border-b border-line bg-white">
          <div className="flex min-h-14 flex-col gap-3 px-4 py-3 lg:flex-row lg:items-center lg:justify-between lg:px-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-navy lg:hidden">Dashboard Divisi</p>
                <p className="text-sm text-slate-500">{activeMenu ? `Dashboard Divisi / ${activeMenu.label}` : 'Dashboard Divisi'}</p>
              </div>
              <span className="text-sm font-medium lg:hidden">{user.name}</span>
            </div>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-4">
              <RoleSwitcher />
              <span className="hidden text-sm font-medium lg:inline">{user.name}</span>
            </div>
            <div className="lg:hidden">{renderMenu('mobile')}</div>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-6">
          <section className="mb-4 grid gap-3 md:grid-cols-3" aria-label="Status konteks">
            <div className="rounded-card border border-line bg-white px-4 py-3 shadow-card">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Breadcrumb</p>
              <p className="mt-1 text-sm font-semibold text-navy">{activeMenu?.label ?? 'Halaman'}</p>
            </div>
            <div className="rounded-card border border-line bg-white px-4 py-3 shadow-card">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Scope aktif</p>
              <p className="mt-1 text-sm font-semibold text-navy">{user.role} · {scopeLabel}</p>
            </div>
            <div className="rounded-card border border-line bg-white px-4 py-3 shadow-card">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Freshness</p>
              <p className="mt-1 text-sm font-semibold text-success">Mock sinkron 10 menit lalu</p>
            </div>
          </section>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
