import {FormEvent, useCallback, useEffect, useMemo, useRef, useState} from 'react'
import {APIError, ConnectionSettings, OBSControlAPI} from '../api'
import {ConnectionScreen} from '../components/ConnectionScreen'
import {Dashboard} from '../components/Dashboard'
import {DashboardData, Notice} from '../components/types'

const storageKey = 'obs-control-web.connection'
const emptyData: DashboardData = {status: {connected: false, currentScene: '', recording: false, streaming: false}, scenes: [], sources: [], telemetry: null, audio: [], studio: null, diagnostics: null}

function savedConnection(): {settings: ConnectionSettings; remember: boolean} {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || '{}') as Partial<ConnectionSettings> & {remember?: boolean}
    return {
      settings: {host: saved.host || '127.0.0.1', port: saved.port || 3456, token: saved.token || sessionStorage.getItem(`${storageKey}.token`) || ''},
      remember: Boolean(saved.remember && saved.token),
    }
  } catch {
    return {settings: {host: '127.0.0.1', port: 3456, token: ''}, remember: false}
  }
}

export function ObsDeckPage() {
  const initial = useMemo(savedConnection, [])
  const [draft, setDraft] = useState(initial.settings)
  const [settings, setSettings] = useState<ConnectionSettings | null>(null)
  const [remember, setRemember] = useState(initial.remember)
  const [data, setData] = useState<DashboardData>(emptyData)
  const [eventOnline, setEventOnline] = useState(false)
  const [eventRetry, setEventRetry] = useState(0)
  const [busy, setBusy] = useState('')
  const [notice, setNotice] = useState<Notice | null>(null)
  const [connecting, setConnecting] = useState(false)
  const [activeSection, setActiveSection] = useState<'control' | 'health' | 'audio' | 'studio' | 'diagnostics'>('control')
  const refreshSequence = useRef(0)
  const eventRefreshTimer = useRef(0)
  const api = useMemo(() => settings ? new OBSControlAPI(settings) : null, [settings])
  const controls = useMemo(() => api ? {
    setScene: (sceneName: string) => api.setScene(sceneName),
    setSourceVisible: (sceneName: string, sourceName: string, visible: boolean) => api.setSourceVisible(sceneName, sourceName, visible),
    setRecording: (active: boolean, commandId: string) => api.setRecording(active, commandId),
    setStreaming: (active: boolean, commandId: string) => api.setStreaming(active, commandId),
    setAudio: (name: string, changes: {muted?: boolean; volumeDb?: number}, commandId: string) => api.updateAudio(name, changes, commandId),
    setPreviewScene: (sceneName: string, commandId: string) => api.setPreviewScene(sceneName, commandId),
    transition: (duration: number, commandId: string) => api.transition(duration, commandId),
    fetchPreview: (sceneName: string, width?: number, quality?: number) => api.preview(sceneName, width, quality),
  } : null, [api])

  const refresh = useCallback(async (client = api, section = activeSection) => {
    if (!client) return
    const sequence = ++refreshSequence.current
    try {
      const status = await client.status()
      const [scenes, sources] = status.connected ? await Promise.all([client.scenes(), client.sources(status.currentScene)]) : [[], []]
      if (sequence !== refreshSequence.current) return
      setData(previous => ({...previous, status, scenes, sources}))
      if (!status.connected) return
      if (section === 'health') {
        const telemetry = await client.telemetry().catch(() => null)
        if (sequence === refreshSequence.current) setData(previous => ({...previous, telemetry}))
      } else if (section === 'audio') {
        const audio = await client.audioInputs().catch(() => [])
        if (sequence === refreshSequence.current) setData(previous => ({...previous, audio}))
      } else if (section === 'studio') {
        const studio = await client.studioMode().catch(() => null)
        if (sequence === refreshSequence.current) setData(previous => ({...previous, studio}))
      } else if (section === 'diagnostics') {
        const diagnostics = await client.diagnostics().catch(() => null)
        if (sequence === refreshSequence.current) setData(previous => ({...previous, diagnostics}))
      }
    } catch (error) {
      if (sequence !== refreshSequence.current) return
      setNotice({kind: 'error', text: error instanceof Error ? error.message : String(error)})
      if (error instanceof APIError && error.status === 401) setSettings(null)
    }
  }, [activeSection, api])

  const refreshSection = useCallback(async (client = api, section = activeSection) => {
    if (!client) return
    if (section === 'health') {
      const telemetry = await client.telemetry().catch(() => null)
      setData(previous => ({...previous, telemetry}))
    } else if (section === 'audio') {
      const audio = await client.audioInputs().catch(() => [])
      setData(previous => ({...previous, audio}))
    }
  }, [activeSection, api])

  useEffect(() => {
    if (!api) return
    refresh(api, activeSection)
  }, [activeSection, api, refresh])

  useEffect(() => {
    if (!api) return
    const interval = eventOnline ? (activeSection === 'health' || activeSection === 'audio' ? 3000 : 0) : 10000
    if (!interval) return
    const update = () => eventOnline ? refreshSection(api, activeSection) : refresh(api, activeSection)
    const timer = window.setInterval(update, interval)
    return () => window.clearInterval(timer)
  }, [activeSection, api, eventOnline, refresh, refreshSection])

  useEffect(() => {
    if (!api) return
    let retryTimer = 0
    const disconnectEvents = api.connectEvents(event => {
      if (event.type === 'obs.event.InputVolumeMeters') return
      window.clearTimeout(eventRefreshTimer.current)
      eventRefreshTimer.current = window.setTimeout(() => refresh(api, activeSection), 400)
    }, online => {
      setEventOnline(online)
      if (!online) retryTimer = window.setTimeout(() => setEventRetry(value => value + 1), 3000)
    })
    return () => { window.clearTimeout(retryTimer); window.clearTimeout(eventRefreshTimer.current); disconnectEvents() }
  }, [activeSection, api, eventRetry, refresh])

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
      setNotice({kind: 'success', text: 'Conectado ao OBS Remote Deck.'})
    } catch (error) {
      setNotice({kind: 'error', text: error instanceof Error ? error.message : String(error)})
    } finally { setConnecting(false) }
  }

  const disconnect = useCallback(() => {
    refreshSequence.current++
    setSettings(null); setData(emptyData); setEventOnline(false)
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
  const refreshDiagnostics = useCallback(async () => {
    if (!api) return
    const diagnostics = await api.diagnostics()
    setData(previous => ({...previous, diagnostics}))
  }, [api])

  if (!settings || !api || !controls) return <ConnectionScreen draft={draft} setDraft={setDraft} remember={remember} setRemember={setRemember} connecting={connecting} notice={notice} onSubmit={connect} />

  return <Dashboard
    address={`${settings.host}:${settings.port}`} data={data} eventOnline={eventOnline} busy={busy} notice={notice}
    dismissNotice={dismissNotice} disconnect={disconnect} runAction={runAction}
    setScene={controls.setScene} setSourceVisible={controls.setSourceVisible}
    setRecording={controls.setRecording} setStreaming={controls.setStreaming}
    setAudio={controls.setAudio} setPreviewScene={controls.setPreviewScene} transition={controls.transition} refreshDiagnostics={refreshDiagnostics}
    fetchPreview={controls.fetchPreview} activeSection={activeSection} setActiveSection={setActiveSection}
  />
}
