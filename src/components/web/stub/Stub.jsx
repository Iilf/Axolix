import { useLocation } from 'react-router-dom'
import { Wrench } from 'lucide-react'

export default function Stub() {
  const { pathname } = useLocation()
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        padding: '80px 24px',
        color: 'var(--color-text-muted)',
      }}
    >
      <Wrench size={28} strokeWidth={1.5} />
      <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text)' }}>
        Page not built yet
      </p>
      <p style={{ fontSize: 13 }}>
        <code
          style={{
            background: 'var(--color-surface-2)',
            padding: '2px 8px',
            borderRadius: 4,
            fontSize: 12,
          }}
        >
          {pathname}
        </code>
      </p>
    </div>
  )
}