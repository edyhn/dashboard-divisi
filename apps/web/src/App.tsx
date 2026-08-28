import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { ErrorBoundary } from './components/ErrorBoundary';
import { RouteGuard } from './components/RouteGuard';
import { AppLayout } from './layout/AppLayout';
import DashboardPage from './pages/DashboardPage';
import DemoStatesPage from './pages/DemoStatesPage';
import KaryawanPage from './pages/KaryawanPage';
import KonfigurasiPage from './pages/KonfigurasiPage';
import LaporanPage from './pages/LaporanPage';
import OmzetPage from './pages/OmzetPage';
import PenilaianPage from './pages/PenilaianPage';
import ProfilPage from './pages/ProfilPage';
import TargetPage from './pages/TargetPage';
import WorkforcePage from './pages/WorkforcePage';
import { SessionProvider, useSession } from './session/SessionContext';
import { homePathForRole } from './mocks/session';

function HomeRedirect() {
  const { user } = useSession();
  return <Navigate to={homePathForRole(user.role)} replace />;
}

export default function App() {
  return (
    <ErrorBoundary>
      <SessionProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<HomeRedirect />} />
              <Route
                path="/dashboard"
                element={
                  <RouteGuard capability="view:division">
                    <DashboardPage />
                  </RouteGuard>
                }
              />
              <Route
                path="/omzet"
                element={
                  <RouteGuard capability="write:revenue">
                    <OmzetPage />
                  </RouteGuard>
                }
              />
              <Route
                path="/target"
                element={
                  <RouteGuard capability="write:target">
                    <TargetPage />
                  </RouteGuard>
                }
              />
              <Route
                path="/penilaian"
                element={
                  <RouteGuard capability="write:assessment">
                    <PenilaianPage />
                  </RouteGuard>
                }
              />
              <Route
                path="/karyawan"
                element={
                  <RouteGuard capability="view:workforce">
                    <KaryawanPage />
                  </RouteGuard>
                }
              />
              <Route
                path="/workforce"
                element={
                  <RouteGuard capability="view:workforce">
                    <WorkforcePage />
                  </RouteGuard>
                }
              />
              <Route
                path="/laporan"
                element={
                  <RouteGuard capability="view:report">
                    <LaporanPage />
                  </RouteGuard>
                }
              />
              <Route
                path="/konfigurasi"
                element={
                  <RouteGuard capability="manage:config">
                    <KonfigurasiPage />
                  </RouteGuard>
                }
              />
              <Route path="/profil" element={<ProfilPage />} />
              <Route path="/demo" element={<DemoStatesPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </SessionProvider>
    </ErrorBoundary>
  );
}
