import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import NavBar, { useTheme } from './components/NavBar.jsx'
import RequireAuth from './components/RequireAuth.jsx'

const Homepage     = lazy(() => import('./web/home/Homepage.jsx'))
const Login        = lazy(() => import('./web/login/Login.jsx'))
const AuthCallback = lazy(() => import('./web/login/AuthCallback.jsx'))
const Dashboard    = lazy(() => import('./web/dashboard/Dashboard.jsx'))
const Stub         = lazy(() => import('./web/stubs/Stub.jsx'))

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
            <Route path="/"              element={<Homepage />} />
            <Route path="/login"         element={<Login />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/directory"     element={<Stub />} />

            {/* Protected */}
            <Route path="/verify" element={<RequireAuth><Stub /></RequireAuth>} />

            <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
            <Route path="/dashboard/:guildId/staff"    element={<RequireAuth><Stub /></RequireAuth>} />
            <Route path="/dashboard/:guildId/roles"    element={<RequireAuth><Stub /></RequireAuth>} />
            <Route path="/dashboard/:guildId/shifts"   element={<RequireAuth><Stub /></RequireAuth>} />
            <Route path="/dashboard/:guildId/bans"     element={<RequireAuth><Stub /></RequireAuth>} />
            <Route path="/dashboard/:guildId/settings" element={<RequireAuth><Stub /></RequireAuth>} />

            <Route path="/resources"          element={<Stub />} />
            <Route path="/resources/:section" element={<Stub />} />
          </Routes>
        </Suspense>
      </main>
    </>
  )
}