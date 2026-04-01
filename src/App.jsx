import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import NavBar, { useTheme } from './components/NavBar.jsx'

const Homepage    = lazy(() => import('./web/home/Homepage.jsx'))
const Login       = lazy(() => import('./web/login/Login.jsx'))
const AuthCallback = lazy(() => import('./web/login/AuthCallback.jsx'))
const Stub        = lazy(() => import('./web/stubs/Stub.jsx'))

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
            {/* Public */}
            <Route path="/"               element={<Homepage />} />
            <Route path="/login"          element={<Login />} />
            <Route path="/auth/callback"  element={<AuthCallback />} />
            <Route path="/verify"         element={<Stub />} />
            <Route path="/directory"      element={<Stub />} />

            {/* Dashboard */}
            <Route path="/dashboard"                        element={<Stub />} />
            <Route path="/dashboard/:guildId/staff"         element={<Stub />} />
            <Route path="/dashboard/:guildId/roles"         element={<Stub />} />
            <Route path="/dashboard/:guildId/shifts"        element={<Stub />} />
            <Route path="/dashboard/:guildId/bans"          element={<Stub />} />
            <Route path="/dashboard/:guildId/settings"      element={<Stub />} />

            {/* Resources */}
            <Route path="/resources"          element={<Stub />} />
            <Route path="/resources/:section" element={<Stub />} />
          </Routes>
        </Suspense>
      </main>
    </>
  )
}