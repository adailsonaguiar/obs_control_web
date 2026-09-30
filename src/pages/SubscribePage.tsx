import {useState} from 'react'
import {useAuth} from '../auth'
import {BillingPlanId, billingPlans, createCheckoutSession, isBillingConfigured} from '../billing'

export function SubscribePage() {
  const {user, loading: authLoading, getToken, signOut} = useAuth()
  const [loading, setLoading] = useState<BillingPlanId | null>(null)
  const [error, setError] = useState('')

  if (authLoading) return <main className="access-page"><div className="access-spinner" /><p>Carregando sua conta…</p></main>
  if (!user) {
    window.location.replace(`/entrar?returnTo=${encodeURIComponent('/assinar')}`)
    return null
  }

  async function checkout(planId: BillingPlanId) {
    setLoading(planId); setError('')
    try { window.location.assign(await createCheckoutSession(planId, {token: await getToken()})) }
    catch (caught) { setError(caught instanceof Error ? caught.message : 'Não foi possível abrir o checkout.'); setLoading(null) }
  }

  return <main className="checkout-page">
    <header><a href="/" className="account-brand"><img src="/logo.png" alt="" /><span><strong>OBS Stream</strong><small>TOOLS</small></span></a><button onClick={() => void signOut().then(() => window.location.assign('/'))}>Sair</button></header>
    <section className="checkout-heading"><span>CONTROLE PTZ PRO</span><h1>Escolha como quer assinar.</h1><p>Os dois planos liberam todas as ferramentas PTZ. Cancele a renovação quando quiser pelo portal de cobrança.</p></section>
    <div className="checkout-plans">{billingPlans.map(plan => <article key={plan.id} className={plan.highlight ? 'highlight' : ''}>
      {plan.highlight && <span className="checkout-badge">ECONOMIZE R$ 40</span>}
      <h2>{plan.name}</h2><strong>{plan.priceLabel}<small>{plan.intervalLabel}</small></strong><p>{plan.description}</p>
      <ul>{plan.features.map(feature => <li key={feature}>{feature}</li>)}</ul>
      <button disabled={!isBillingConfigured || Boolean(loading)} onClick={() => void checkout(plan.id)}>{loading === plan.id ? 'Abrindo Stripe…' : `Assinar ${plan.name.toLowerCase()}`}</button>
    </article>)}</div>
    {!isBillingConfigured && <p className="checkout-notice">Configure VITE_BILLING_API_URL para ativar o checkout.</p>}
    {error && <p className="checkout-failure" role="alert">{error}</p>}
    <div className="checkout-trust"><span>Pagamento processado pela Stripe</span><span>Acesso vinculado a {user.email}</span><span>Sem dados de cartão neste site</span></div>
  </main>
}
