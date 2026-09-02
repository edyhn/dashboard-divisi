import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { ErrorBoundary } from './components/ErrorBoundary';
import { RouteGuard } from './components/RouteGuard';
import { LoadingState } from './components/states';
import { ToastProvider } from './components/ui/Toast';
import { AppLayout } from './layout/AppLayout';
import { AuthProvider, useAuth } from './session/AuthContext';
import { SessionProvider, useSession } from './session/SessionContext';
import { homePathForRole } from './mocks/session';

// SOP 1B: Pages lazy — DILARANG eager import (anti-pattern). SOP 5: ErrorBoundary per-route + Suspense.
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const DemoStatesPage = lazy(() => import('./pages/DemoStatesPage'));
const KaryawanPage = lazy(() => import('./pages/KaryawanPage'));
const KonfigurasiPage = lazy(() => import('./pages/KonfigurasiPage'));
const LaporanPage = lazy(() => import('./pages/LaporanPage'));
const OmzetPage = lazy(() => import('./pages/OmzetPage'));
const PenilaianPage = lazy(() => import('./pages/PenilaianPage'));
const ProfilPage = lazy(() => import('./pages/ProfilPage'));
const TargetPage = lazy(() => import('./pages/TargetPage'));
const WorkforcePage = lazy(() => import('./pages/WorkforcePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 menit — anti refetch storm
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function HomeRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-6 text-sm text-slate-500">Memuat sesi...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={homePathForRole(user.role as never)} replace />;
}

function AuthHomeRedirect() {
  const { user } = useSession();
  return <Navigate to={homePathForRole(user.role)} replace />;
}

function RouteSuspense({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingState label="Memuat halaman..." />}>{children}</Suspense>
    </ErrorBoundary>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <SessionProvider>
              <BrowserRouter>
              <Routes>
                <Route path="/login" element={<RouteSuspense><LoginPage /></RouteSuspense>} />
                <Route element={<AppLayout />}>
                  <Route path="/" element={<HomeRedirect />} />
                  <Route path="/legacy" element={<AuthHomeRedirect />} />
                <Route
                  path="/dashboard"
                  element={
                    <RouteGuard capability="view:division">
                      <RouteSuspense>
                        <DashboardPage />
                      </RouteSuspense>
                    </RouteGuard>
                  }
                />
                <Route
                  path="/omzet"
                  element={
                    <RouteGuard capability="write:revenue">
                      <RouteSuspense>
                        <OmzetPage />
                      </RouteSuspense>
                    </RouteGuard>
                  }
                />
                <Route
                  path="/target"
                  element={
                    <RouteGuard capability="write:target">
                      <RouteSuspense>
                        <TargetPage />
                      </RouteSuspense>
                    </RouteGuard>
                  }
                />
                <Route
                  path="/penilaian"
                  element={
                    <RouteGuard capability="write:assessment">
                      <RouteSuspense>
                        <PenilaianPage />
                      </RouteSuspense>
                    </RouteGuard>
                  }
                />
                <Route
                  path="/karyawan"
                  element={
                    <RouteGuard capability="view:workforce">
                      <RouteSuspense>
                        <KaryawanPage />
                      </RouteSuspense>
                    </RouteGuard>
                  }
                />
                <Route
                  path="/workforce"
                  element={
                    <RouteGuard capability="view:workforce">
                      <RouteSuspense>
                        <WorkforcePage />
                      </RouteSuspense>
                    </RouteGuard>
                  }
                />
                <Route
                  path="/laporan"
                  element={
                    <RouteGuard capability="view:report">
                      <RouteSuspense>
                        <LaporanPage />
                      </RouteSuspense>
                    </RouteGuard>
                  }
                />
                <Route
                  path="/konfigurasi"
                  element={
                    <RouteGuard capability="manage:config">
                      <RouteSuspense>
                        <KonfigurasiPage />
                      </RouteSuspense>
                    </RouteGuard>
                  }
                />
                <Route
                  path="/profil"
                  element={
                    <RouteSuspense>
                      <ProfilPage />
                    </RouteSuspense>
                  }
                />
                <Route
                  path="/demo"
                  element={
                    <RouteSuspense>
                      <DemoStatesPage />
                    </RouteSuspense>
                  }
                />
                </Route>
              </Routes>
              </BrowserRouter>
            </SessionProvider>
          </AuthProvider>
        </QueryClientProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}
