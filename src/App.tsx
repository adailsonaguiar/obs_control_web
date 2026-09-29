import {FormEvent, useCallback, useEffect, useMemo, useRef, useState} from 'react'
import {APIError, ConnectionSettings, OBSControlAPI, ServerEvent} from './api'
import {ConnectionScreen} from './components/ConnectionScreen'
import {Dashboard} from './components/Dashboard'
import {DashboardData, Notice} from './components/types'

const storageKey = 'obs-control-web.connection'
const emptyData: DashboardData = {status: {connected: false, currentScene: '', recording: false, streaming: false}, scenes: [], sources: []}

function savedConnection(): {settings: ConnectionSettings; remember: boolean} {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || '{}') as Partial<ConnectionSettings> & {remember?: boolean}
    return {
      settings: {host: saved.host || location.hostname || '127.0.0.1', port: saved.port || 3456, token: saved.token || sessionStorage.getItem(`${storageKey}.token`) || ''},
      remember: Boolean(saved.remember && saved.token),
    }
  } catch {
    return {settings: {host: location.hostname || '127.0.0.1', port: 3456, token: ''}, remember: false}
  }
}

function App() {
  const initial = useMemo(savedConnection, [])
  const [draft, setDraft] = useState(initial.settings)
  const [settings, setSettings] = useState<ConnectionSettings | null>(null)
  const [remember, setRemember] = useState(initial.remember)
  const [data, setData] = useState<DashboardData>(emptyData)
  const [events, setEvents] = useState<ServerEvent[]>([])
  const [eventOnline, setEventOnline] = useState(false)
  const [eventRetry, setEventRetry] = useState(0)
  const [busy, setBusy] = useState('')
  const [notice, setNotice] = useState<Notice | null>(null)
  const [connecting, setConnecting] = useState(false)
  const refreshSequence = useRef(0)
  const api = useMemo(() => settings ? new OBSControlAPI(settings) : null, [settings])
  const controls = useMemo(() => api ? {
    setScene: (sceneName: string) => api.setScene(sceneName),
    setSourceVisible: (sceneName: string, sourceName: string, visible: boolean) => api.setSourceVisible(sceneName, sourceName, visible),
    setRecording: (active: boolean) => api.setRecording(active),
    setStreaming: (active: boolean) => api.setStreaming(active),
    fetchPreview: (sceneName: string, width?: number) => api.preview(sceneName, width),
  } : null, [api])

  const refresh = useCallback(async (client = api) => {
    if (!client) return
    const sequence = ++refreshSequence.current
    try {
      const status = await client.status()
      const [scenes, sources] = status.connected
        ? await Promise.all([client.scenes(), client.sources(status.currentScene)])
        : [[], []]
      if (sequence === refreshSequence.current) setData({status, scenes, sources})
    } catch (error) {
      if (sequence !== refreshSequence.current) return
      setNotice({kind: 'error', text: error instanceof Error ? error.message : String(error)})
      if (error instanceof APIError && error.status === 401) setSettings(null)
    }
  }, [api])

  useEffect(() => {
    if (!api) return
    refresh(api)
    const timer = window.setInterval(() => refresh(api), 4000)
    return () => window.clearInterval(timer)
  }, [api, refresh])

  useEffect(() => {
    if (!api) return
    let retryTimer = 0
    const disconnectEvents = api.connectEvents(event => {
      setEvents(previous => [event, ...previous].slice(0, 25))
      refresh(api)
    }, online => {
      setEventOnline(online)
      if (!online) retryTimer = window.setTimeout(() => setEventRetry(value => value + 1), 3000)
    })
    return () => { window.clearTimeout(retryTimer); disconnectEvents() }
  }, [api, eventRetry, refresh])

  async function connect(event: FormEvent) {
    event.preventDefault(); setConnecting(true); setNotice(null)
    const client = new OBSControlAPI(draft)
    try {
      await client.health(); await client.status()
      const normalized = client.settings
      localStorage.setItem(storageKey, JSON.stringify(remember ? {...normalized, remember: true} : {host: normalized.host, port: normalized.port, remember: false}))
      if (remember) sessionStorage.removeItem(`${storageKey}.token`)
      else sessionStorage.setItem(`${storageKey}.token`, normalized.token)
      setDraft(normalized); setSettings(normalized)
      setNotice({kind: 'success', text: 'Conectado ao OBS Control Server.'})
    } catch (error) {
      setNotice({kind: 'error', text: error instanceof Error ? error.message : String(error)})
    } finally { setConnecting(false) }
  }

  const disconnect = useCallback(() => {
    refreshSequence.current++
    setSettings(null); setData(emptyData); setEvents([]); setEventOnline(false)
    sessionStorage.removeItem(`${storageKey}.token`)
    setDraft(previous => ({...previous, token: remember ? previous.token : ''}))
  }, [remember])

  const runAction = useCallback(async (name: string, operation: () => Promise<unknown>, message: string) => {
    setBusy(name); setNotice(null)
    try { await operation(); await refresh(); setNotice({kind: 'success', text: message}) }
    catch (error) { setNotice({kind: 'error', text: error instanceof Error ? error.message : String(error)}) }
    finally { setBusy('') }
  }, [refresh])
  const dismissNotice = useCallback(() => setNotice(null), [])

  if (!settings || !api || !controls) return <ConnectionScreen draft={draft} setDraft={setDraft} remember={remember} setRemember={setRemember} connecting={connecting} notice={notice} onSubmit={connect} />

  return <Dashboard
    address={`${settings.host}:${settings.port}`} data={data} events={events} eventOnline={eventOnline} busy={busy} notice={notice}
    dismissNotice={dismissNotice} disconnect={disconnect} runAction={runAction}
    setScene={controls.setScene} setSourceVisible={controls.setSourceVisible}
    setRecording={controls.setRecording} setStreaming={controls.setStreaming}
    fetchPreview={controls.fetchPreview}
  />
}

export default App
