import {billingPlans} from '../billing'
import {ContactFooter} from '../components/ContactFooter'

const tools = [
  {name: 'OBS Deck', availability: 'GRÁTIS', image: '/obs-deck-studio.png', href: '/deck', action: 'Abrir o OBS Deck', title: 'A mesa de corte que cabe em qualquer tela.', description: 'Controle o essencial da transmissão sem voltar ao computador principal. O Deck conecta ao servidor local e mantém a operação sincronizada em tempo real.', features: [['Cenas e fontes', 'Troque a cena no ar e mostre ou oculte fontes sem navegar pelos painéis do OBS.'], ['Gravação e transmissão', 'Inicie e pare as saídas com estado visual claro antes de cada comando.'], ['Saúde e diagnóstico', 'Acompanhe conexão, eventos e indicadores operacionais em uma única tela.']]},
  {name: 'Controle PTZ Pro', availability: 'ASSINATURA', image: '/ptz-studio.png', href: '/assinar', action: 'Conhecer os planos', title: 'Movimento preciso sem um controlador dedicado.', description: 'Opere câmeras VISCA over IP com comandos projetados para mouse e toque. Cada câmera preserva seus ajustes e presets para a próxima produção.', features: [['Joystick e setas', 'Escolha o modo de controle, ajuste velocidade e sensibilidade e trave um eixo quando precisar.'], ['Zoom e presets', 'Aproxime, afaste e recupere enquadramentos salvos em poucos segundos.'], ['Múltiplas câmeras', 'Cadastre endereços, portas e previews e alterne entre equipamentos sem perder contexto.']]},
]

export function LandingPage() {
  const monthly = billingPlans.find(plan => plan.id === 'ptz-monthly')!
  const yearly = billingPlans.find(plan => plan.id === 'ptz-yearly')!

  return <div className="landing marketing">
    <header className="marketing-header">
      <a className="landing-brand" href="/" aria-label="OBS Stream Tools — início"><span className="logo"><img src="/logo.png" alt="" /></span><span><strong>OBS Stream</strong><small>TOOLS</small></span></a>
      <nav aria-label="Navegação principal"><a href="#ferramentas">Ferramentas</a><a href="#como-funciona">Como funciona</a><a href="#planos">Planos PTZ</a></nav>
      <div className="marketing-header-actions"><a href="/entrar">Entrar</a><a className="marketing-cta" href="/deck">Abrir Deck</a></div>
    </header>
    <main>
      <section className="marketing-hero">
        <div className="marketing-hero-copy"><h1>Seu estúdio responde <em>daqui.</em></h1><p>Controle o OBS e suas câmeras PTZ pelo navegador. Menos equipamentos entre você e a transmissão, mais clareza para operar ao vivo.</p><div><a className="marketing-primary" href="/deck">Usar OBS Deck grátis <span aria-hidden="true">→</span></a><a className="marketing-secondary" href="#ferramentas">Ver como funciona</a></div><ul><li>Sem instalação no celular</li><li>Opera na rede local</li><li>Pronto para toque e mouse</li></ul></div>
        <figure className="marketing-hero-visual"><img src="/obs-deck-studio.png" alt="OBS Deck aberto em um monitor e celular em um estúdio de transmissão" /><figcaption><strong>OBS Deck</strong><span>Controle gratuito para sua produção</span></figcaption></figure>
      </section>
      <section className="marketing-proof"><p>Uma superfície de controle para o ritmo real de uma produção.</p><div><span>CENAS</span><span>FONTES</span><span>SAÍDAS</span><span>VISCA OVER IP</span><span>PRESETS</span></div></section>
      <section className="marketing-tools" id="ferramentas">
        <header><h2>Duas ferramentas.<br />Um fluxo sem interrupções.</h2><p>Comece pelo controle gratuito do OBS. Quando sua produção pedir movimentos de câmera, o PTZ Pro entra no mesmo ambiente.</p></header>
        {tools.map((tool, index) => <article className={`marketing-tool ${index % 2 ? 'reverse' : ''}`} key={tool.name}><figure><img src={tool.image} alt={`${tool.name} em uso em um estúdio`} loading="lazy" decoding="async" /></figure><div className="marketing-tool-copy"><div className="tool-meta"><span>{tool.availability}</span><small>{tool.name}</small></div><h3>{tool.title}</h3><p>{tool.description}</p><dl>{tool.features.map(([name, text]) => <div key={name}><dt>{name}</dt><dd>{text}</dd></div>)}</dl><a href={tool.href}>{tool.action}<span aria-hidden="true">→</span></a></div></article>)}
      </section>
      <section className="marketing-how" id="como-funciona"><div><h2>Do OBS ao navegador,<br />sem expor sua produção.</h2><p>O servidor local faz a ponte entre o OBS Studio e os dispositivos da mesma rede. Você configura uma vez e opera de onde fizer sentido.</p><a href="https://github.com/adailsonaguiar/obs_control_server/releases" target="_blank" rel="noreferrer">Baixar servidor <span aria-hidden="true">↗</span></a></div><ol><li><span>1</span><div><strong>Instale no computador do OBS</strong><p>O aplicativo servidor conecta ao WebSocket do OBS Studio.</p></div></li><li><span>2</span><div><strong>Libere a rede local</strong><p>Copie IP, porta e token exibidos pelo servidor.</p></div></li><li><span>3</span><div><strong>Abra em qualquer tela</strong><p>Use o Deck ou o PTZ no navegador do celular, tablet ou computador.</p></div></li></ol></section>
      <section className="marketing-pricing" id="planos"><header><h2>OBS Deck grátis.<br />PTZ Pro no seu ritmo.</h2><p>A assinatura libera toda a superfície de controle de câmeras. O pagamento acontece na Stripe e o acesso fica vinculado à sua conta.</p></header><div className="marketing-pricing-grid"><article><span>OBS DECK</span><h3>Grátis</h3><strong>R$ 0</strong><p>Controle cenas, fontes, gravação e transmissão na rede local.</p><ul><li>Deck completo</li><li>Preview e estados em tempo real</li><li>Uso em celular, tablet e computador</li></ul><a href="/deck">Começar agora</a></article><article><span>PTZ PRO MENSAL</span><h3>{monthly.name}</h3><strong>{monthly.priceLabel}<small>{monthly.intervalLabel}</small></strong><p>{monthly.description}</p><ul>{monthly.features.slice(0, 3).map(feature => <li key={feature}>{feature}</li>)}</ul><a href="/assinar">Assinar mensal</a></article><article className="recommended"><span>PTZ PRO · MELHOR VALOR</span><h3>{yearly.name}</h3><strong>{yearly.priceLabel}<small>{yearly.intervalLabel}</small></strong><p>{yearly.description}</p><ul>{yearly.features.slice(0, 3).map(feature => <li key={feature}>{feature}</li>)}</ul><a href="/assinar">Assinar anual</a></article></div></section>
    </main>
    <footer className="marketing-footer"><div className="landing-footer-brand"><strong>OBS Stream Tools</strong><span>Ferramentas simples. Transmissões melhores.</span></div><ContactFooter /></footer>
  </div>
}
