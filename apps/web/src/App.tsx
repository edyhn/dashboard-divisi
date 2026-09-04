import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { ErrorBoundary } from './components/ErrorBoundary';
import { RouteGuard } from './components/RouteGuard';
import { LoadingState } from './components/states';
import { ToastProvider } from './components/ui/Toast';
import { AppLayout } from './layout/AppLayout';
import { AuthProvider, useAuth } from './session/AuthContext';

const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const LaporanPage = lazy(() => import('./pages/LaporanPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const DailyReportPage = lazy(() => import('./pages/DailyReportPage'));
const TenantRevenuePage = lazy(() => import('./pages/TenantRevenuePage'));
const BudgetingPage = lazy(() => import('./pages/BudgetingPage'));
const CashflowPage = lazy(() => import('./pages/CashflowPage'));
const PnlPage = lazy(() => import('./pages/PnlPage'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function HomeRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-6 text-sm text-slate-500">Memuat sesi...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to="/dashboard" replace />;
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
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<RouteSuspense><LoginPage /></RouteSuspense>} />
                <Route element={<AppLayout />}>
                  <Route path="/" element={<HomeRedirect />} />
                  <Route
                    path="/dashboard"
                    element={
                      <RouteGuard>
                        <RouteSuspense>
                          <DashboardPage />
                        </RouteSuspense>
                      </RouteGuard>
                    }
                  />
                  <Route
                    path="/laporan-harian"
                    element={
                      <RouteGuard>
                        <RouteSuspense>
                          <DailyReportPage />
                        </RouteSuspense>
                      </RouteGuard>
                    }
                  />
                  <Route
                    path="/rincian-tenant"
                    element={
                      <RouteGuard>
                        <RouteSuspense>
                          <TenantRevenuePage />
                        </RouteSuspense>
                      </RouteGuard>
                    }
                  />
                  <Route
                    path="/laporan"
                    element={
                      <RouteGuard>
                        <RouteSuspense>
                          <LaporanPage />
                        </RouteSuspense>
                      </RouteGuard>
                    }
                  />
                  <Route
                    path="/budgeting"
                    element={
                      <RouteGuard>
                        <RouteSuspense>
                          <BudgetingPage />
                        </RouteSuspense>
                      </RouteGuard>
                    }
                  />
                  <Route
                    path="/cashflow"
                    element={
                      <RouteGuard>
                        <RouteSuspense>
                          <CashflowPage />
                        </RouteSuspense>
                      </RouteGuard>
                    }
                  />
                  <Route
                    path="/pnl"
                    element={
                      <RouteGuard>
                        <RouteSuspense>
                          <PnlPage />
                        </RouteSuspense>
                      </RouteGuard>
                    }
                  />
                </Route>
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </BrowserRouter>
          </AuthProvider>
        </QueryClientProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}
