import {SEO} from './components/SEO'
import {ObsDeckPage} from './pages/ObsDeckPage'
import {LandingPage} from './pages/LandingPage'
import {PTZPage} from './pages/PTZPage'
import {AuthPage} from './pages/AuthPage'
import {SubscribePage} from './pages/SubscribePage'
import {CheckoutResultPage} from './pages/CheckoutResultPage'
import {ProtectedPTZ} from './components/ProtectedPTZ'

function App() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/'

  if (path === '/deck') return <><SEO title="OBS Deck | Controle remoto para OBS Studio" description="Controle cenas, fontes, gravações e transmissões do OBS Studio pelo navegador, usando seu celular, tablet ou computador na rede local." path="/deck" type="product" /><ObsDeckPage /></>
  if (path === '/entrar') return <><SEO title="Entrar | OBS Stream Tools" description="Entre na sua conta do OBS Stream Tools." path="/entrar" /><AuthPage /></>
  if (path === '/assinar') return <><SEO title="Assine o Controle PTZ Pro" description="Escolha o plano mensal ou anual para liberar o controle de câmeras PTZ." path="/assinar" type="product" /><SubscribePage /></>
  if (path === '/checkout/sucesso') return <CheckoutResultPage status="success" />
  if (path === '/checkout/cancelado') return <CheckoutResultPage status="cancelled" />
  if (path === '/ptz' || path === '/ptz/setas') return <ProtectedPTZ><SEO title="Controle PTZ por setas | VISCA over IP" description="Controle preciso de câmeras PTZ por setas com VISCA over IP." path="/ptz/setas" type="product" /><PTZPage mode="arrows" /></ProtectedPTZ>
  if (path === '/ptz/joystick') return <ProtectedPTZ><SEO title="Joystick PTZ | VISCA over IP" description="Controle suave de câmeras PTZ com joystick virtual e VISCA over IP." path="/ptz/joystick" type="product" /><PTZPage mode="joystick" /></ProtectedPTZ>
  return <><SEO title="OBS Stream Tools | Ferramentas para OBS Studio" description="Ferramentas para controlar, automatizar e simplificar transmissões no OBS Studio. Conheça o OBS Deck e controle cenas, fontes e saídas pela rede local." path="/" /><LandingPage /></>
}

export default App
