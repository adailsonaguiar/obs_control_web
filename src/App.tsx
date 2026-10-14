import {SEO} from './components/SEO'
import {ObsDeckPage} from './pages/ObsDeckPage'
import {LandingPage} from './pages/LandingPage'
import {PTZPage} from './pages/PTZPage'
import {AuthPage} from './pages/AuthPage'
import {SubscribePage} from './pages/SubscribePage'
import {CheckoutResultPage} from './pages/CheckoutResultPage'
import {ProductsPage} from './pages/ProductsPage'
import {GuidePage} from './pages/GuidePage'
import {ProtectedProduct} from './components/ProtectedProduct'
import {RequireAuth} from './components/RequireAuth'
import {PrivacyConsent} from './components/PrivacyConsent'
import {LegalPage} from './pages/LegalPage'

function App() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/'

  let page

  if (path === '/termos') page = <><SEO title="Termos de Uso | OBS Stream Tools" description="Consulte os Termos de Uso do OBS Stream Tools." path="/termos" /><LegalPage kind="terms" /></>
  else if (path === '/privacidade') page = <><SEO title="Política de Privacidade | OBS Stream Tools" description="Saiba como a VEROLAB trata dados pessoais no OBS Stream Tools." path="/privacidade" /><LegalPage kind="privacy" /></>
  else if (path === '/cancelamento-e-reembolso') page = <><SEO title="Cancelamento e Reembolso | OBS Stream Tools" description="Consulte as condições de cancelamento e reembolso do OBS Stream Tools." path="/cancelamento-e-reembolso" /><LegalPage kind="cancellation" /></>

  else if (path === '/produtos') page = <RequireAuth><SEO title="Central de produtos | OBS Stream Tools" description="Acesse o OBS Deck e o Controle PTZ em uma única central de produção." path="/produtos" /><ProductsPage /></RequireAuth>
  else if (path === '/deck') page = <ProtectedProduct productName="O OBS Deck"><SEO title="OBS Deck | Controle remoto para OBS Studio" description="Controle cenas, fontes, gravações e transmissões do OBS Studio pelo navegador, usando seu celular, tablet ou computador na rede local." path="/deck" type="product" /><ObsDeckPage /></ProtectedProduct>
  else if (path === '/entrar') page = <><SEO title="Entrar | OBS Stream Tools" description="Entre na sua conta do OBS Stream Tools." path="/entrar" /><AuthPage /></>
  else if (path === '/assinar') page = <><SEO title="Assine o OBS Stream Tools" description="Escolha o plano mensal ou anual para liberar o OBS Deck e o Controle PTZ." path="/assinar" type="product" /><SubscribePage /></>
  else if (path === '/checkout/sucesso') page = <CheckoutResultPage status="success" />
  else if (path === '/checkout/cancelado') page = <CheckoutResultPage status="cancelled" />
  else if (path === '/como-usar/obs-deck') page = <><SEO title="Como usar o OBS Deck | OBS Stream Tools" description="Aprenda a conectar e controlar o OBS Studio pelo navegador." path="/como-usar/obs-deck" /><GuidePage kind="deck" /></>
  else if (path === '/como-usar/ptz') page = <><SEO title="Como usar o Controle PTZ | OBS Stream Tools" description="Aprenda a cadastrar e operar câmeras VISCA over IP pelo navegador." path="/como-usar/ptz" /><GuidePage kind="ptz" /></>
  else if (path === '/ptz' || path === '/ptz/setas') page = <ProtectedProduct productName="O Controle PTZ"><SEO title="Controle PTZ por setas | VISCA over IP" description="Controle preciso de câmeras PTZ por setas com VISCA over IP." path="/ptz/setas" type="product" /><PTZPage mode="arrows" /></ProtectedProduct>
  else if (path === '/ptz/joystick') page = <ProtectedProduct productName="O Controle PTZ"><SEO title="Joystick PTZ | VISCA over IP" description="Controle suave de câmeras PTZ com joystick virtual e VISCA over IP." path="/ptz/joystick" type="product" /><PTZPage mode="joystick" /></ProtectedProduct>
  else page = <><SEO title="OBS Stream Tools | Ferramentas para OBS Studio" description="Ferramentas para controlar, automatizar e simplificar transmissões no OBS Studio. Conheça o OBS Deck e controle cenas, fontes e saídas pela rede local." path="/" /><LandingPage /></>

  return <>{page}<PrivacyConsent /></>
}

export default App
