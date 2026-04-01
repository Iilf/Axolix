import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Zap } from 'lucide-react'
import { supabase } from '../../shared.jsx'

export default function AuthCallback() {
  const navigate  = useNavigate()
  const calledRef = useRef(false)

  useEffect(() => {
    if (calledRef.current) return
    calledRef.current = true

    // Supabase automatically exchanges the code in the URL fragment/query.
    // We just wait for the session to be ready then redirect.
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        navigate('/dashboard', { replace: true })
      } else if (event === 'SIGNED_OUT' || !session) {
        navigate('/login?error=auth_failed', { replace: true })
      }
    })
  }, [navigate])

  return (
    <div className="login-page">
      <div className="login-card card" style={{ alignItems: 'center' }}>
        <div className="login-card__logo">
          <Zap size={22} strokeWidth={2.5} />
          <span>Axolix</span>
        </div>
        <p style={{ color: 'var(--text-2)', fontSize: 14 }}>Signing you in…</p>
      </div>
    </div>
  )
}