import {useCallback, useEffect, useState} from 'react'
import {useAuth} from '../auth'
import {createBillingPortalSession, Entitlement, getPTZEntitlement} from '../billing'
import {LegalFooter} from '../components/LegalFooter'

const products = [
  {name: 'OBS Deck', image: '/Screenshot3.png', href: '/deck', action: 'Abrir OBS Deck', description: 'Controle cenas, fontes, áudio, gravação e transmissão a partir de qualquer tela na sua rede local.', features: ['Cenas e fontes', 'Áudio e saídas', 'Diagnóstico em tempo real']},
  {name: 'Controle PTZ', image: '/Screenshot4.png', href: '/ptz', action: 'Abrir Controle PTZ', description: 'Opere câmeras VISCA over IP com joystick, setas, zoom e presets salvos por câmera.', features: ['Joystick e setas', 'Zoom e presets', 'Múltiplas câmeras']},
]

export function ProductsPage() {
  const {user, getToken, signOut} = useAuth()
  const [access, setAccess] = useState<'checking' | 'active' | 'inactive' | 'error'>('checking')
  const [entitlement, setEntitlement] = useState<Entitlement | null>(null)
  const [portalLoading, setPortalLoading] = useState(false)

  const checkAccess = useCallback(async () => {
    setAccess('checking')
    try { const result = await getPTZEntitlement(await getToken()); setEntitlement(result); setAccess(result.active ? 'active' : 'inactive') }
    catch { setAccess('error') }
  }, [getToken])

  useEffect(() => {
    let current = true
    void getToken().then(getPTZEntitlement).then(result => { if (current) { setEntitlement(result); setAccess(result.active ? 'active' : 'inactive') } }).catch(() => current && setAccess('error'))
    return () => { current = false }
  }, [getToken])

  async function openPortal() {
    setPortalLoading(true)
    try { window.location.assign(await createBillingPortalSession(await getToken())) }
    catch { setAccess('error'); setPortalLoading(false) }
  }

  const formatDate = (value?: string) => value ? new Intl.DateTimeFormat('pt-BR', {dateStyle: 'long'}).format(new Date(value)) : '—'

  return <main className="products-page">
    <header><a href="/" className="account-brand"><img src="/logo.png" alt="" /><span><strong>OBS Stream</strong><small>TOOLS</small></span></a><div><span>{user?.email}</span><button onClick={() => void signOut().then(() => window.location.assign('/'))}>Sair</button></div></header>
    <section className="products-intro"><h1>Sua central de produção.</h1><p>Escolha a superfície certa para o que está acontecendo no estúdio agora. As duas ferramentas trabalham com o mesmo servidor local.</p><div className={`products-access ${access}`} role="status" aria-live="polite"><strong>{access === 'active' ? 'Assinatura ativa' : access === 'checking' ? 'Verificando assinatura' : access === 'error' ? 'Não foi possível verificar' : 'Assinatura necessária'}</strong><span>{access === 'active' ? 'OBS Deck e Controle PTZ liberados.' : access === 'checking' ? 'Consultando o acesso da sua conta…' : access === 'error' ? 'Confira sua conexão e consulte novamente.' : 'Assine para liberar as duas ferramentas.'}</span>{access === 'inactive' && <a href="/assinar">Ver planos</a>}{access === 'error' && <button onClick={() => void checkAccess()}>Tentar novamente</button>}</div></section>
    <section className="products-grid" aria-label="Ferramentas disponíveis">{products.map(product => <article key={product.name}><figure><img src={product.image} alt={`${product.name} em uso em um estúdio`} /></figure><div><h2>{product.name}</h2><p>{product.description}</p><ul>{product.features.map(feature => <li key={feature}>{feature}</li>)}</ul>{access === 'active' ? <a href={product.href}>{product.action}<span aria-hidden="true">→</span></a> : <span className="products-locked">Disponível com assinatura ativa</span>}</div></article>)}</section>
    {entitlement && <section className="subscription-panel"><div><span>ASSINATURA</span><h2>{entitlement.planId === 'ptz-yearly' ? 'Plano anual' : 'Plano mensal'}</h2><p>{entitlement.status === 'trialing' ? `Teste gratuito até ${formatDate(entitlement.trialEnd)}` : entitlement.cancelAtPeriodEnd ? `Cancelada. Acesso até ${formatDate(entitlement.currentPeriodEnd)}` : `Próxima cobrança em ${formatDate(entitlement.nextChargeAt || entitlement.currentPeriodEnd)}`}</p></div><dl><div><dt>Estado</dt><dd>{entitlement.status || 'inativo'}</dd></div><div><dt>Fim do período</dt><dd>{formatDate(entitlement.currentPeriodEnd)}</dd></div></dl>{entitlement.active && <button onClick={() => void openPortal()} disabled={portalLoading}>{portalLoading ? 'Abrindo portal…' : 'Gerenciar ou cancelar'}</button>}<p>O cancelamento é feito em autosserviço pela Stripe. Suporte, arrependimento ou cobrança indevida: <a href="mailto:verolabso@gmail.com">verolabso@gmail.com</a>.</p></section>}
    <LegalFooter compact />
  </main>
}
