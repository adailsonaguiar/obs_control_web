import {SEO} from './components/SEO'
import {ObsDeckPage} from './pages/ObsDeckPage'
import {LandingPage} from './pages/LandingPage'

function App() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/'

  if (path === '/deck') return <><SEO title="OBS Deck | Controle remoto para OBS Studio" description="Controle cenas, fontes, gravações e transmissões do OBS Studio pelo navegador, usando seu celular, tablet ou computador na rede local." path="/deck" type="product" /><ObsDeckPage /></>
  return <><SEO title="OBS Stream Tools | Ferramentas para OBS Studio" description="Ferramentas para controlar, automatizar e simplificar transmissões no OBS Studio. Conheça o OBS Deck e controle cenas, fontes e saídas pela rede local." path="/" /><LandingPage /></>
}

export default App
