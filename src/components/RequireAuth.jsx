import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../shared.jsx'

// Wraps any page that requires login.
// Shows nothing while session is loading, redirects to /login if no session.
export default function RequireAuth({ children }) {
  const { session, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && session === null) {
      navigate('/login', { replace: true })
    }
  }, [loading, session, navigate])

  if (loading) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: 'var(--text-2)', fontSize: 14 }}>Loading…</span>
      </div>
    )
  }

  if (!session) return null

  return children
}