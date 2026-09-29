import {SEO} from './components/SEO'
import {ObsDeckPage} from './pages/ObsDeckPage'
import {LandingPage} from './pages/LandingPage'
import {PTZPage} from './pages/PTZPage'

function App() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/'

  if (path === '/deck') return <><SEO title="OBS Deck | Controle remoto para OBS Studio" description="Controle cenas, fontes, gravações e transmissões do OBS Studio pelo navegador, usando seu celular, tablet ou computador na rede local." path="/deck" type="product" /><ObsDeckPage /></>
  if (path === '/ptz') return <><SEO title="Controle PTZ | VISCA over IP" description="Controle direção e zoom de câmeras PTZ com VISCA over IP pela rede local." path="/ptz" type="product" /><PTZPage /></>
  return <><SEO title="OBS Stream Tools | Ferramentas para OBS Studio" description="Ferramentas para controlar, automatizar e simplificar transmissões no OBS Studio. Conheça o OBS Deck e controle cenas, fontes e saídas pela rede local." path="/" /><LandingPage /></>
}

export default App
