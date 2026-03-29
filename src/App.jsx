import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const Homepage  = lazy(() => import('./web/Homepage/Homepage'));


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