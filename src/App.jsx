import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const Homepage  = lazy(() => import('./web/Homepage/Homepage'));
const Login     = lazy(() => import('./web/Login/Login'));
const Verify    = lazy(() => import('./web/Verify/Verify'));
const Directory = lazy(() => import('./web/Directory/Directory'));
const Dashboard = lazy(() => import('./web/Dashboard/Dashboard'));
const Resources = lazy(() => import('./web/Resources/Resources'));
const Staff     = lazy(() => import('./web/Staff/Staff'));
const Roles     = lazy(() => import('./web/Staff/Roles/Roles'));
const Shifts    = lazy(() => import('./web/Staff/Shifts/Shifts'));
const Bans      = lazy(() => import('./web/Staff/Bans/Bans'));
const Settings  = lazy(() => import('./web/Staff/Settings/Settings'));

function PageSpinner() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', background: '#0d0f1a', color: '#7c5cfc',
    }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <Loader2 size={28} style={{ animation: 'spin 0.7s linear infinite' }} />
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<PageSpinner />}>
      <Routes>
        <Route path="/"                                element={<Homepage />} />
        <Route path="/login"                           element={<Login />} />
        <Route path="/verify"                          element={<Verify />} />
        <Route path="/directory"                       element={<Directory />} />
        <Route path="/dashboard"                       element={<Dashboard />} />
        <Route path="/resources"                       element={<Resources />} />
        <Route path="/resources/:section"              element={<Resources />} />
        <Route path="/dashboard/:guildId/staff"        element={<Staff />} />
        <Route path="/dashboard/:guildId/roles"        element={<Roles />} />
        <Route path="/dashboard/:guildId/shifts"       element={<Shifts />} />
        <Route path="/dashboard/:guildId/bans"         element={<Bans />} />
        <Route path="/dashboard/:guildId/settings"     element={<Settings />} />
      </Routes>
    </Suspense>
  );
}