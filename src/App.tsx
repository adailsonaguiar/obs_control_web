import {ObsDeckPage} from './pages/ObsDeckPage'
import {LandingPage} from './pages/LandingPage'

function App() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/'

  if (path === '/obsdeck') return <ObsDeckPage />
  return <LandingPage />
}

export default App
