import {useEffect} from 'react'
import {ObsDeckPage} from './pages/ObsDeckPage'
import {LandingPage} from './pages/LandingPage'

function App() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/'

  useEffect(() => {
    document.title = path === '/obsdeck' ? 'OBS Deck | OBS Stream Tools' : 'OBS Stream Tools'
  }, [path])

  if (path === '/obsdeck') return <ObsDeckPage />
  return <LandingPage />
}

export default App
