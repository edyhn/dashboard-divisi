import { BrowserRouter, Navigate, Route, Routes } from 'react-router';

import { ErrorBoundary } from './components/ErrorBoundary';
import { AppLayout } from './layout/AppLayout';
import DashboardPage from './pages/DashboardPage';
import DemoStatesPage from './pages/DemoStatesPage';
import KaryawanPage from './pages/KaryawanPage';
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
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/omzet" element={<OmzetPage />} />
              <Route path="/target" element={<TargetPage />} />
              <Route path="/penilaian" element={<PenilaianPage />} />
              <Route path="/karyawan" element={<KaryawanPage />} />
              <Route path="/workforce" element={<WorkforcePage />} />
              <Route path="/laporan" element={<LaporanPage />} />
              <Route path="/profil" element={<ProfilPage />} />
              <Route path="/demo" element={<DemoStatesPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </SessionProvider>
    </ErrorBoundary>
  );
}
