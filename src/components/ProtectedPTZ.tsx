import {ReactNode, useEffect, useState} from 'react'
import {useAuth} from '../auth'
import {getPTZEntitlement} from '../billing'

export function ProtectedPTZ({children}: {children: ReactNode}) {
  const {user, loading, getToken, signOut} = useAuth()
  const [access, setAccess] = useState<'checking' | 'active' | 'inactive' | 'error'>('checking')

  useEffect(() => {
    if (!user) return
    let current = true
    void getToken().then(getPTZEntitlement).then(result => current && setAccess(result.active ? 'active' : 'inactive')).catch(() => current && setAccess('error'))
    return () => { current = false }
  }, [getToken, user])

  if (loading || (user && access === 'checking')) return <main className="access-page"><div className="access-spinner" /><p>Validando seu acesso PTZ…</p></main>
  if (!user) { window.location.replace(`/entrar?returnTo=${encodeURIComponent(window.location.pathname)}`); return null }
  if (access === 'active') return <>{children}</>

  return <main className="access-page"><section><span>{access === 'error' ? 'NÃO FOI POSSÍVEL VALIDAR' : 'RECURSO PREMIUM'}</span><h1>{access === 'error' ? 'A verificação de acesso falhou.' : 'O controle PTZ precisa de uma assinatura ativa.'}</h1><p>{access === 'error' ? 'Confira a conexão e tente novamente. O acesso nunca é liberado apenas pelo navegador.' : 'Assine o plano mensal ou anual para controlar câmeras, joystick, zoom e presets.'}</p><div><a href={access === 'error' ? window.location.pathname : '/assinar'}>{access === 'error' ? 'Tentar novamente' : 'Ver planos'}</a><button onClick={() => void signOut().then(() => window.location.assign('/entrar'))}>Trocar conta</button></div></section></main>
}
