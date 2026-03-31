import { useLocation } from 'react-router-dom'
import { Wrench } from 'lucide-react'

export default function Stub() {
  const { pathname } = useLocation()
  return (
    <div className="stub-page">
      <Wrench size={28} strokeWidth={1.5} />
      <h3>Page not built yet</h3>
      <span className="stub-page__path">{pathname}</span>
    </div>
  )
}