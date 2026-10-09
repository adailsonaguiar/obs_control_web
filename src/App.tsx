import {SEO} from './components/SEO'
import {ObsDeckPage} from './pages/ObsDeckPage'
import {LandingPage} from './pages/LandingPage'
import {PTZPage} from './pages/PTZPage'
import {AuthPage} from './pages/AuthPage'
import {SubscribePage} from './pages/SubscribePage'
import {CheckoutResultPage} from './pages/CheckoutResultPage'
import {ProductsPage} from './pages/ProductsPage'
import {ProtectedProduct} from './components/ProtectedProduct'
import {RequireAuth} from './components/RequireAuth'

function App() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/'

  if (path === '/produtos') return <RequireAuth><SEO title="Central de produtos | OBS Stream Tools" description="Acesse o OBS Deck e o Controle PTZ em uma única central de produção." path="/produtos" /><ProductsPage /></RequireAuth>
  if (path === '/deck') return <ProtectedProduct productName="O OBS Deck"><SEO title="OBS Deck | Controle remoto para OBS Studio" description="Controle cenas, fontes, gravações e transmissões do OBS Studio pelo navegador, usando seu celular, tablet ou computador na rede local." path="/deck" type="product" /><ObsDeckPage /></ProtectedProduct>
  if (path === '/entrar') return <><SEO title="Entrar | OBS Stream Tools" description="Entre na sua conta do OBS Stream Tools." path="/entrar" /><AuthPage /></>
  if (path === '/assinar') return <><SEO title="Assine o OBS Stream Tools" description="Escolha o plano mensal ou anual para liberar o OBS Deck e o Controle PTZ." path="/assinar" type="product" /><SubscribePage /></>
  if (path === '/checkout/sucesso') return <CheckoutResultPage status="success" />
  if (path === '/checkout/cancelado') return <CheckoutResultPage status="cancelled" />
  if (path === '/ptz' || path === '/ptz/setas') return <ProtectedProduct productName="O Controle PTZ"><SEO title="Controle PTZ por setas | VISCA over IP" description="Controle preciso de câmeras PTZ por setas com VISCA over IP." path="/ptz/setas" type="product" /><PTZPage mode="arrows" /></ProtectedProduct>
  if (path === '/ptz/joystick') return <ProtectedProduct productName="O Controle PTZ"><SEO title="Joystick PTZ | VISCA over IP" description="Controle suave de câmeras PTZ com joystick virtual e VISCA over IP." path="/ptz/joystick" type="product" /><PTZPage mode="joystick" /></ProtectedProduct>
  return <><SEO title="OBS Stream Tools | Ferramentas para OBS Studio" description="Ferramentas para controlar, automatizar e simplificar transmissões no OBS Studio. Conheça o OBS Deck e controle cenas, fontes e saídas pela rede local." path="/" /><LandingPage /></>
}

export default App
