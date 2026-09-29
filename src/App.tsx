import {useEffect} from 'react'
import {ObsDeckPage} from './pages/ObsDeckPage'
import {LandingPage} from './pages/LandingPage'

function App() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/'

  useEffect(() => {
    document.title = path === '/deck' ? 'OBS Deck | OBS Stream Tools' : 'OBS Stream Tools'
  }, [path])

  if (path === '/deck') return <ObsDeckPage />
  return <LandingPage />
}

export default App
