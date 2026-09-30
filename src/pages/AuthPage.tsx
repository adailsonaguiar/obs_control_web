import {FormEvent, useState} from 'react'
import {isAuthConfigured, useAuth} from '../auth'

function messageFor(error: unknown) {
  const code = typeof error === 'object' && error && 'code' in error ? String(error.code) : ''
  if (code.includes('invalid-credential')) return 'E-mail ou senha incorretos.'
  if (code.includes('email-already-in-use')) return 'Este e-mail já possui uma conta.'
  if (code.includes('weak-password')) return 'Use uma senha com pelo menos 6 caracteres.'
  return error instanceof Error ? error.message : 'Não foi possível autenticar. Tente novamente.'
}

export function AuthPage() {
  const {signIn, signUp} = useAuth()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [state, setState] = useState<'idle' | 'loading' | 'error'>('idle')
  const [error, setError] = useState('')
  const params = new URLSearchParams(window.location.search)
  const requestedReturn = params.get('returnTo')
  const returnTo = requestedReturn?.startsWith('/') ? requestedReturn : '/assinar'

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    setState('loading'); setError('')
    try {
      const email = String(data.get('email')).trim()
      const password = String(data.get('password'))
      await (mode === 'login' ? signIn(email, password) : signUp(email, password))
      window.location.assign(returnTo)
    } catch (caught) { setError(messageFor(caught)); setState('error') }
  }

  return <main className="account-page">
    <a className="account-brand" href="/"><img src="/logo.png" alt="" /><span><strong>OBS Stream</strong><small>TOOLS</small></span></a>
    <section className="account-card">
      <div className="account-intro"><span>ACESSO SEGURO</span><h1>{mode === 'login' ? 'Entre para controlar suas câmeras.' : 'Crie sua conta de operador.'}</h1><p>Seu acesso identifica a assinatura PTZ e mantém a compra vinculada a você.</p></div>
      {!isAuthConfigured && <p className="account-alert" role="alert">Configure as variáveis VITE_FIREBASE_* para ativar a autenticação.</p>}
      <form onSubmit={submit}>
        <label>E-mail<input name="email" type="email" autoComplete="email" required /></label>
        <label>Senha<input name="password" type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} minLength={6} required /></label>
        {error && <p className="account-error" role="alert">{error}</p>}
        <button disabled={!isAuthConfigured || state === 'loading'}>{state === 'loading' ? 'Aguarde…' : mode === 'login' ? 'Entrar' : 'Criar conta'}</button>
      </form>
      <button className="account-switch" onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setState('idle') }}>{mode === 'login' ? 'Ainda não tenho conta' : 'Já tenho uma conta'}</button>
      <p className="account-security">A cobrança é processada no checkout seguro da Stripe. O site não recebe os dados do seu cartão.</p>
    </section>
  </main>
}
