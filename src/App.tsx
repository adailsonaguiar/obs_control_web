import {ObsDeckPage} from './pages/ObsDeckPage'

function App() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/'

  if (path === '/obsdeck') return <ObsDeckPage />

  return <main className="route-placeholder">
    <h1>OBS Stream Tools</h1>
    <p>Ferramentas para simplificar sua produção no OBS.</p>
    <a href="/obsdeck">Abrir OBS Deck</a>
  </main>
}

export default App
