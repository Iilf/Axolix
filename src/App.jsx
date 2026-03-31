import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import NavBar from './components/NavBar.jsx'

// ── Lazy page imports ──────────────────────────────────────────────────────
const Homepage   = lazy(() => import('./web/home/Homepage.jsx'))

// Stubs — replace with real imports as pages are built
const Login      = lazy(() => import('./web/stubs/Stub.jsx'))
const Verify     = lazy(() => import('./web/stubs/Stub.jsx'))
const Directory  = lazy(() => import('./web/stubs/Stub.jsx'))
const Dashboard  = lazy(() => import('./web/stubs/Stub.jsx'))
const Staff      = lazy(() => import('./web/stubs/Stub.jsx'))
const Roles      = lazy(() => import('./web/stubs/Stub.jsx'))
const Shifts     = lazy(() => import('./web/stubs/Stub.jsx'))
const Bans       = lazy(() => import('./web/stubs/Stub.jsx'))
const Settings   = lazy(() => import('./web/stubs/Stub.jsx'))
const Resources  = lazy(() => import('./web/stubs/Stub.jsx'))

// ── Fallback ───────────────────────────────────────────────────────────────
function PageLoader() {
  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>Loading…</span>
    </div>
  )
}

// ── App ────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <>
      <NavBar />
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public */}
            <Route path="/"                                 element={<Homepage />} />
            <Route path="/login"                            element={<Login />} />
            <Route path="/verify"                           element={<Verify />} />
            <Route path="/directory"                        element={<Directory />} />

            {/* Dashboard */}
            <Route path="/dashboard"                        element={<Dashboard />} />
            <Route path="/dashboard/:guildId/staff"         element={<Staff />} />
            <Route path="/dashboard/:guildId/roles"         element={<Roles />} />
            <Route path="/dashboard/:guildId/shifts"        element={<Shifts />} />
            <Route path="/dashboard/:guildId/bans"          element={<Bans />} />
            <Route path="/dashboard/:guildId/settings"      element={<Settings />} />

            {/* Resources */}
            <Route path="/resources"                        element={<Resources />} />
            <Route path="/resources/:section"               element={<Resources />} />
          </Routes>
        </Suspense>
      </main>
    </>
  )
}