import {ReactNode} from 'react'
import {useAuth} from '../auth'

export function RequireAuth({children}: {children: ReactNode}) {
  const {user, loading} = useAuth()

  if (loading) return <main className="access-page"><div className="access-spinner" /><p>Carregando sua conta…</p></main>
  if (!user) {
    const returnTo = `${window.location.pathname}${window.location.search}`
    window.location.replace(`/entrar?returnTo=${encodeURIComponent(returnTo)}`)
    return null
  }

  return <>{children}</>
}
