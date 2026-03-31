import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import NavBar, { useTheme } from './components/NavBar.jsx'

// ── Lazy page imports ──────────────────────────────────────────────────────
const Homepage  = lazy(() => import('./web/home/Homepage.jsx'))
const Stub      = lazy(() => import('./web/stubs/Stub.jsx'))

function PageLoader() {
  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ color: 'var(--text-2)', fontSize: 14 }}>Loading…</span>
    </div>
  )
}

export default function App() {
  const [theme, setTheme] = useTheme()

  return (
    <>
      <NavBar theme={theme} setTheme={setTheme} />
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/"                            element={<Homepage />} />
            <Route path="/login"                       element={<Stub />} />
            <Route path="/verify"                      element={<Stub />} />
            <Route path="/directory"                   element={<Stub />} />
            <Route path="/dashboard"                   element={<Stub />} />
            <Route path="/dashboard/:guildId/staff"    element={<Stub />} />
            <Route path="/dashboard/:guildId/roles"    element={<Stub />} />
            <Route path="/dashboard/:guildId/shifts"   element={<Stub />} />
            <Route path="/dashboard/:guildId/bans"     element={<Stub />} />
            <Route path="/dashboard/:guildId/settings" element={<Stub />} />
            <Route path="/resources"                   element={<Stub />} />
            <Route path="/resources/:section"          element={<Stub />} />
          </Routes>
        </Suspense>
      </main>
    </>
  )
}