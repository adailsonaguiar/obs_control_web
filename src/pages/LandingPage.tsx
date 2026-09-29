import {useState} from 'react'
import {billingPlans, createCheckoutSession, isBillingConfigured} from '../billing'
import {ContactFooter} from '../components/ContactFooter'

const features = [
  {number: '01', title: 'Controle de qualquer tela', text: 'Troque cenas, fontes e saídas pelo celular, tablet ou computador na mesma rede.'},
  {number: '02', title: 'Visão em tempo real', text: 'Acompanhe o programa, o status do OBS e os eventos de gravação e transmissão.'},
  {number: '03', title: 'Feito para crescer', text: 'Uma central única para as próximas ferramentas do seu fluxo de streaming.'},
]

export function LandingPage() {
  const [checkoutState, setCheckoutState] = useState<'idle' | 'loading' | 'error'>('idle')
  const proPlan = billingPlans[0]

  async function startCheckout() {
    if (!isBillingConfigured) return
    setCheckoutState('loading')
    try {
      window.location.assign(await createCheckoutSession(proPlan.id))
    } catch {
      setCheckoutState('error')
    }
  }

  return <div className="landing">
    <header className="landing-header">
      <a className="landing-brand" href="/" aria-label="OBS Stream Tools — início">
        <span className="logo"><img src="/logo.png" alt="" /></span>
        <span><strong>OBS Stream</strong><small>TOOLS</small></span>
      </a>
      <nav aria-label="Navegação principal">
        <a href="#ferramentas">Ferramentas</a>
        <a href="#recursos">Recursos</a>
        <a href="#planos">Planos</a>
      </nav>
      <a className="landing-header-cta" href="/obsdeck">Abrir OBS Deck</a>
    </header>

    <main>
      <section className="landing-hero">
        <div className="hero-copy">
          <p className="eyebrow"><span /> FERRAMENTAS PARA QUEM TRANSMITE</p>
          <h1>Seu OBS mais simples.<br /><em>Seu conteúdo no controle.</em></h1>
          <p className="hero-description">Uma coleção de ferramentas práticas para operar, automatizar e evoluir suas transmissões sem interromper o que realmente importa.</p>
          <div className="hero-actions">
            <a className="primary-action" href="/obsdeck">Usar OBS Deck <span>→</span></a>
            <a className="secondary-action" href="#ferramentas">Conhecer as ferramentas</a>
          </div>
          <div className="hero-notes"><span>✓ Sem instalação no celular</span><span>✓ Conexão pela rede local</span></div>
        </div>
        <div className="hero-console" aria-label="Representação do painel OBS Deck">
          <div className="console-bar"><span className="console-brand"><i /> OBS DECK</span><span className="console-online"><i /> ONLINE</span></div>
          <div className="console-preview"><div className="preview-frame"><span>PROGRAMA</span><strong>NO AR</strong></div></div>
          <div className="console-status"><span><i /> Cena principal</span><span><i /> Pronto para gravar</span></div>
          <div className="console-scenes"><button>CÂMERA</button><button className="active">PROGRAMA</button><button>INTERVALO</button></div>
        </div>
      </section>

      <section className="landing-tools" id="ferramentas">
        <div className="section-heading"><div><p className="eyebrow">NOSSA CAIXA DE FERRAMENTAS</p><h2>Menos cliques.<br />Mais controle.</h2></div><p>Comece pelo OBS Deck. Novas ferramentas serão adicionadas aqui para tornar cada etapa da sua produção mais fluida.</p></div>
        <article className="tool-card featured">
          <div className="tool-number">01</div>
          <div className="tool-icon"><span>●</span><span>■</span><span>◉</span></div>
          <div className="tool-copy"><p>DISPONÍVEL AGORA</p><h3>OBS Deck</h3><span>Controle remoto para cenas, fontes, gravação e transmissão — direto do navegador.</span></div>
          <a href="/obsdeck" aria-label="Abrir OBS Deck">→</a>
        </article>
        <div className="coming-tools">
          <article><span>02</span><div><small>EM DESENVOLVIMENTO</small><strong>Automação</strong><p>Rotinas e ações para seu fluxo.</p></div></article>
          <article><span>03</span><div><small>EM BREVE</small><strong>Monitoramento</strong><p>Métricas essenciais em um só lugar.</p></div></article>
        </div>
      </section>

      <section className="landing-features" id="recursos">
        <p className="eyebrow">PENSADO PARA A OPERAÇÃO REAL</p>
        <h2>Do setup ao ao vivo,<br />sem complicação.</h2>
        <div className="feature-grid">{features.map(feature => <article key={feature.number}><span>{feature.number}</span><h3>{feature.title}</h3><p>{feature.text}</p></article>)}</div>
      </section>

      <section className="landing-pricing" id="planos">
        <div className="pricing-heading"><p className="eyebrow">PLANOS</p><h2>Comece agora.<br />Evolua quando precisar.</h2><p>Use o controle essencial gratuitamente e acompanhe a chegada das ferramentas avançadas.</p></div>
        <div className="pricing-grid">
          <article><span className="plan-label">ESSENCIAL</span><h3>Grátis</h3><strong>R$ 0 <small>/ para sempre</small></strong><p>O necessário para controlar seu OBS de qualquer tela na rede local.</p><ul><li>OBS Deck completo</li><li>Cenas, fontes e saídas</li><li>Prévia em tempo real</li></ul><a className="plan-action" href="/obsdeck">Começar agora</a></article>
          <article className="pro-plan"><span className="plan-label">PARA CRIADORES</span><h3>{proPlan.name}</h3><strong>{proPlan.priceLabel}</strong><p>{proPlan.description}</p><ul>{proPlan.features.map(feature => <li key={feature}>{feature}</li>)}</ul>{isBillingConfigured
            ? <button className="plan-action" disabled={checkoutState === 'loading'} onClick={startCheckout}>{checkoutState === 'loading' ? 'Abrindo checkout…' : 'Assinar plano Pro'}</button>
            : <a className="plan-action" href="mailto:verolabso@gmail.com?subject=Interesse%20no%20OBS%20Stream%20Tools%20Pro">Tenho interesse</a>}
            {checkoutState === 'error' && <small className="checkout-error" role="alert">Não foi possível abrir o checkout. Tente novamente.</small>}
          </article>
        </div>
      </section>
    </main>

    <footer className="landing-footer"><div className="landing-footer-brand"><strong>OBS Stream Tools</strong><span>Ferramentas simples. Transmissões melhores.</span></div><ContactFooter /></footer>
  </div>
}
