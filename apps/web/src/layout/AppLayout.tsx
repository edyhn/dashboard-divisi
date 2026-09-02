import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, TrendingUp, Target, Award, Users, ClipboardList, BarChart3, Settings, LogOut, Menu, X } from 'lucide-react';
import { MENU_ITEMS, roleDisplay } from '../mocks/session';
import { useAuth } from '../session/AuthContext';
import { useSession } from '../session/SessionContext';
import { hasCapability } from '../session/capability';

const ICON_MAP: Record<string, React.ElementType> = {
  '/dashboard': LayoutDashboard,
  '/omzet': TrendingUp,
  '/target': Target,
  '/penilaian': Award,
  '/karyawan': Users,
  '/workforce': ClipboardList,
  '/laporan': BarChart3,
  '/konfigurasi': Settings,
};

export function AppLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setDrawerOpen(false); };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [drawerOpen]);
  let authUser: ReturnType<typeof useAuth>['user'] | null = null;
  let authLogout: () => Promise<void> = async () => {};
  try {
    const a = useAuth();
    authUser = a.user;
    authLogout = a.logout;
  } catch {}
  let sessionUser: ReturnType<typeof useSession>['user'] | null = null;
  try {
    const s = useSession();
    sessionUser = s.user;
  } catch {}
  const user = authUser ?? (sessionUser as unknown as typeof authUser) ?? null;
  const logout = authLogout;

  const location = useLocation();

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <p className="text-sm text-slate-500">Memuat sesi — silakan login</p>
      </div>
    );
  }

  const activeMenu = MENU_ITEMS.find((item) => item.path === location.pathname);
  const roleLabel = roleDisplay(user.role);
  const scopeLabel = user.divisionCode ?? 'Semua divisi';

  const visibleMenu = MENU_ITEMS.filter((item) => {
    if (!item.roles.includes(user.role as never)) return false;
    if (item.capability && !hasCapability(user.role as never, item.capability)) return false;
    return true;
  });

  const renderMenu = (variant: 'sidebar' | 'mobile') => (
    <nav className={variant === 'sidebar' ? 'flex flex-col gap-1.5' : 'flex gap-2 overflow-x-auto pb-2 scrollbar-thin'} aria-label={variant === 'sidebar' ? 'Navigasi utama' : 'Navigasi mobile'}>
      {visibleMenu.map((item) => {
        const Icon = ICON_MAP[item.path] ?? LayoutDashboard;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              isActive
                ? 'flex shrink-0 items-center gap-2.5 rounded-card bg-white/15 px-3 py-2.5 text-sm font-medium text-white shadow-glass backdrop-blur'
                : 'flex shrink-0 items-center gap-2.5 rounded-card px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white transition-colors'
            }
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-surface">
      {/* Drawer mobile overlay */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-navy/40 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} aria-hidden="true" />
          <aside className="absolute left-0 top-0 h-full w-64 bg-gradient-to-b from-navy via-navy to-navy-light px-4 py-6 text-slate-200 shadow-glass">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-card-lg bg-white/15 text-white font-bold text-sm">DD</div><p className="text-sm font-semibold text-white">Dashboard Divisi</p></div>
              <button type="button" aria-label="Tutup menu" onClick={() => setDrawerOpen(false)} className="rounded-input p-1 text-slate-300 hover:bg-white/10 hover:text-white"><X className="h-5 w-5" /></button>
            </div>
            <nav className="flex flex-col gap-1.5" aria-label="Navigasi drawer">
              {visibleMenu.map((item) => {
                const Icon = ICON_MAP[item.path] ?? LayoutDashboard;
                return <NavLink key={item.path} to={item.path} onClick={() => setDrawerOpen(false)} className={({ isActive }) => isActive ? 'flex items-center gap-2.5 rounded-card-lg bg-white/15 px-3 py-2.5 text-sm font-medium text-white shadow-glass' : 'flex items-center gap-2.5 rounded-card-lg px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/10'}><Icon className="h-4 w-4" />{item.label}</NavLink>;
              })}
            </nav>
            <div className="absolute bottom-4 left-4 right-4 rounded-card-lg bg-white/10 p-3"><p className="text-xs font-medium text-white">{user.name}</p><p className="text-xs text-slate-300">{roleLabel} · {scopeLabel}</p><button onClick={() => void logout()} className="mt-2 flex w-full items-center gap-1.5 rounded-input bg-white/10 px-2 py-1.5 text-xs font-medium text-white hover:bg-white/15"><LogOut className="h-3.5 w-3.5" /> Keluar</button></div>
          </aside>
        </div>
      )}
      {/* Modern sidebar with gradient */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 bg-gradient-to-b from-navy via-navy to-navy-light px-4 py-6 text-slate-200 lg:block shadow-glass">
        <div className="mb-8 flex items-center gap-3 px-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-card bg-white/15 text-white font-bold text-sm">DD</div>
          <div>
            <p className="text-sm font-semibold text-white leading-none">Dashboard Divisi</p>
            <p className="text-xs text-slate-400">7 divisi · Real BE</p>
          </div>
        </div>
        {renderMenu('sidebar')}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="rounded-card bg-white/10 p-3">
            <p className="text-xs font-medium text-white">{user.name}</p>
            <p className="text-xs text-slate-300">{roleLabel} · {scopeLabel}</p>
            <button onClick={() => void logout()} className="mt-2 flex w-full items-center gap-1.5 rounded-input bg-white/10 px-2 py-1.5 text-xs font-medium text-white hover:bg-white/15 transition-colors">
              <LogOut className="h-3.5 w-3.5" /> Keluar
            </button>
          </div>
        </div>
      </aside>

      <div className="flex min-h-screen flex-col lg:ml-64">
        {/* Glass header */}
        <header className="sticky top-0 z-40 border-b border-line/60 bg-white/80 glass supports-[backdrop-filter]:bg-white/60">
          <div className="flex min-h-16 flex-col gap-3 px-4 py-3 lg:flex-row lg:items-center lg:justify-between lg:px-6">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <button type="button" aria-label="Buka menu" onClick={() => setDrawerOpen(true)} className="lg:hidden rounded-input border border-line p-2 text-navy hover:bg-surface"><Menu className="h-5 w-5" /></button>
                <div>
                  <p className="text-sm font-semibold text-navy lg:hidden">Dashboard Divisi</p>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <span className="hidden lg:inline">Dashboard Divisi</span>
                    {activeMenu && <><span className="text-slate-300">/</span><span className="font-medium text-navy">{activeMenu.label}</span></>}
                  </div>
                </div>
              </div>
              <span className="text-sm font-medium lg:hidden">{user.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden lg:flex items-center gap-2 rounded-full bg-surface px-3 py-1.5 text-xs">
                <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
                <span className="font-medium text-navy">{roleLabel}</span>
                <span className="text-slate-400">·</span>
                <span className="text-slate-600">{scopeLabel}</span>
              </div>
              <button onClick={() => void logout()} className="hidden lg:flex items-center gap-1.5 rounded-input border border-line bg-white px-3 py-1.5 text-sm font-medium text-navy hover:bg-surface transition-colors">
                <LogOut className="h-4 w-4" /> Keluar
              </button>
            </div>
            <div className="lg:hidden">{renderMenu('mobile')}</div>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-6 bg-surface">
          {/* Modern context cards with glass */}
          <section className="mb-6 grid gap-3 md:grid-cols-3" aria-label="Status konteks">
            <div className="rounded-card-lg border border-line/60 bg-white p-4 shadow-card hover:shadow-card-hover transition-shadow">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Breadcrumb</p>
              <p className="mt-1 text-sm font-semibold text-navy flex items-center gap-2">
                {activeMenu?.label ?? 'Halaman'}
                <span className="rounded-pill bg-primary-light px-2 py-0.5 text-xs font-medium text-primary">Real BE</span>
              </p>
            </div>
            <div className="rounded-card-lg border border-line/60 bg-white p-4 shadow-card hover:shadow-card-hover transition-shadow">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Scope aktif</p>
              <p className="mt-1 text-sm font-semibold text-navy">{roleLabel} · {scopeLabel}</p>
              <p className="text-xs text-slate-500">Envelope trace_id aktif</p>
            </div>
            <div className="rounded-card-lg border border-line/60 bg-gradient-to-br from-success-light to-white p-4 shadow-card">
              <p className="text-xs font-medium uppercase tracking-wider text-success">Freshness</p>
              <p className="mt-1 text-sm font-semibold text-success flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
                Sinkron real-time
              </p>
              <p className="text-xs text-slate-600">Via proxy /api · CORS OK</p>
            </div>
          </section>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
