import {FormEvent, useCallback, useEffect, useMemo, useState} from 'react'
import {APIError, ConnectionSettings, OBSControlAPI, OBSStatus, Scene, ServerEvent, Source} from './api'

const storageKey = 'obs-control-web.connection'
const emptyStatus: OBSStatus = {connected: false, currentScene: '', recording: false, streaming: false}

type Notice = {kind: 'success' | 'error' | 'info'; text: string}

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
  const [status, setStatus] = useState<OBSStatus>(emptyStatus)
  const [scenes, setScenes] = useState<Scene[]>([])
  const [sources, setSources] = useState<Source[]>([])
  const [events, setEvents] = useState<ServerEvent[]>([])
  const [eventOnline, setEventOnline] = useState(false)
  const [eventRetry, setEventRetry] = useState(0)
  const [busy, setBusy] = useState('')
  const [notice, setNotice] = useState<Notice | null>(null)
  const [connecting, setConnecting] = useState(false)
  const api = useMemo(() => settings ? new OBSControlAPI(settings) : null, [settings])

  const refresh = useCallback(async (client = api) => {
    if (!client) return
    try {
      const nextStatus = await client.status()
      setStatus(nextStatus)
      if (nextStatus.connected) {
        const [nextScenes, nextSources] = await Promise.all([client.scenes(), client.sources(nextStatus.currentScene)])
        setScenes(nextScenes); setSources(nextSources)
      } else {
        setScenes([]); setSources([])
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      setNotice({kind: 'error', text: message})
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
    const disconnect = api.connectEvents(event => {
      setEvents(previous => [event, ...previous].slice(0, 25))
      refresh(api)
    }, online => {
      setEventOnline(online)
      if (!online) retryTimer = window.setTimeout(() => setEventRetry(value => value + 1), 3000)
    })
    return () => { window.clearTimeout(retryTimer); disconnect() }
  }, [api, eventRetry, refresh])

  async function connect(event: FormEvent) {
    event.preventDefault(); setConnecting(true); setNotice(null)
    const client = new OBSControlAPI(draft)
    try {
      await client.health()
      await client.status()
      const normalized = client.settings
      const saved = remember ? {...normalized, remember: true} : {host: normalized.host, port: normalized.port, remember: false}
      localStorage.setItem(storageKey, JSON.stringify(saved))
      if (remember) sessionStorage.removeItem(`${storageKey}.token`)
      else sessionStorage.setItem(`${storageKey}.token`, normalized.token)
      setDraft(normalized); setSettings(normalized)
      setNotice({kind: 'success', text: 'Conectado ao OBS Control Server.'})
    } catch (error) {
      setNotice({kind: 'error', text: error instanceof Error ? error.message : String(error)})
    } finally { setConnecting(false) }
  }

  function disconnect() {
    setSettings(null); setStatus(emptyStatus); setScenes([]); setSources([]); setEvents([]); setEventOnline(false)
    sessionStorage.removeItem(`${storageKey}.token`)
    setDraft(previous => ({...previous, token: remember ? previous.token : ''}))
  }

  async function action(name: string, operation: () => Promise<unknown>, message: string) {
    setBusy(name); setNotice(null)
    try { await operation(); setNotice({kind: 'success', text: message}); await refresh() }
    catch (error) { setNotice({kind: 'error', text: error instanceof Error ? error.message : String(error)}) }
    finally { setBusy('') }
  }

  if (!settings || !api) return <ConnectionScreen draft={draft} setDraft={setDraft} remember={remember} setRemember={setRemember} connecting={connecting} notice={notice} onSubmit={connect} />

  return <div className="app-shell">
    <header className="topbar">
      <div className="identity"><span className="logo">OC</span><div><strong>OBS Remote</strong><small>{settings.host}:{settings.port}</small></div></div>
      <div className="connection"><span className={eventOnline ? 'signal online' : 'signal'} />{eventOnline ? 'Tempo real' : 'Polling ativo'}<button onClick={disconnect}>Trocar servidor</button></div>
    </header>

    <main className="dashboard">
      <div className="page-heading"><div><p>CONTROLE REMOTO</p><h1>Painel do OBS</h1></div><div className={`obs-state ${status.connected ? 'online' : ''}`}><span />{status.connected ? 'OBS conectado' : 'OBS desconectado'}</div></div>
      {notice && <div className={`notice ${notice.kind}`}><span>{notice.text}</span><button onClick={() => setNotice(null)}>×</button></div>}

      <section className="status-strip">
        <Status title="Cena no ar" value={status.currentScene || 'Indisponível'} active={status.connected} />
        <Status title="Gravação" value={status.recording ? 'GRAVANDO' : 'Parada'} active={status.recording} alert={status.recording} />
        <Status title="Transmissão" value={status.streaming ? 'AO VIVO' : 'Offline'} active={status.streaming} alert={status.streaming} />
        <Status title="Eventos" value={eventOnline ? 'Conectado' : 'Reconectando'} active={eventOnline} />
      </section>

      <section className="output-controls">
        <button className={status.recording ? 'stop active' : 'record'} disabled={!status.connected || !!busy} onClick={() => action('recording', () => api.setRecording(!status.recording), status.recording ? 'Gravação encerrada.' : 'Gravação iniciada.')}><span>{status.recording ? '■' : '●'}</span><div><strong>{status.recording ? 'Parar gravação' : 'Iniciar gravação'}</strong><small>Arquivo local do OBS</small></div></button>
        <button className={status.streaming ? 'stop active' : 'stream'} disabled={!status.connected || !!busy} onClick={() => action('streaming', () => api.setStreaming(!status.streaming), status.streaming ? 'Transmissão encerrada.' : 'Transmissão iniciada.')}><span>{status.streaming ? '■' : '◉'}</span><div><strong>{status.streaming ? 'Parar transmissão' : 'Iniciar transmissão'}</strong><small>Saída configurada no OBS</small></div></button>
      </section>

      <div className="workspace">
        <section className="panel scenes-panel"><PanelHeading title="Cenas" count={scenes.length} /><div className="scene-grid">{scenes.map(scene => <button key={scene.name} className={scene.name === status.currentScene ? 'selected' : ''} disabled={!!busy} onClick={() => action('scene', () => api.setScene(scene.name), `Cena alterada para “${scene.name}”.`)}><span>{scene.name.slice(0, 2).toUpperCase()}</span><strong>{scene.name}</strong>{scene.name === status.currentScene && <em>NO AR</em>}</button>)}{!scenes.length && <Empty text="Nenhuma cena disponível" />}</div></section>

        <section className="panel sources-panel"><PanelHeading title="Fontes da cena" count={sources.length} /><div className="source-list">{sources.map(source => <div className="source" key={source.id}><button className={source.enabled ? 'eye visible' : 'eye'} disabled={!!busy} aria-label={source.enabled ? 'Ocultar fonte' : 'Mostrar fonte'} onClick={() => action('source', () => api.setSourceVisible(source.sceneName, source.name, !source.enabled), `Fonte “${source.name}” ${source.enabled ? 'ocultada' : 'exibida'}.`)}>{source.enabled ? '●' : '○'}</button><strong>{source.name}</strong><span>{source.enabled ? 'Visível' : 'Oculta'}</span></div>)}{!sources.length && <Empty text="Nenhuma fonte na cena atual" />}</div></section>

        <section className="panel events-panel"><PanelHeading title="Atividade recente" count={events.length} /><div className="event-list">{events.map(event => <div className="event" key={event.id}><time>{new Date(event.time).toLocaleTimeString('pt-BR')}</time><span>{eventLabel(event.type)}</span></div>)}{!events.length && <Empty text="Aguardando eventos em tempo real" />}</div></section>
      </div>
    </main>
  </div>
}

function ConnectionScreen({draft, setDraft, remember, setRemember, connecting, notice, onSubmit}: {draft: ConnectionSettings; setDraft: (value: ConnectionSettings) => void; remember: boolean; setRemember: (value: boolean) => void; connecting: boolean; notice: Notice | null; onSubmit: (event: FormEvent) => void}) {
  return <main className="connect-page"><section className="connect-card"><div className="connect-brand"><span className="logo large">OC</span><div><p>OBS CONTROL</p><h1>Controle remoto</h1></div></div><p className="connect-copy">Conecte ao servidor que está rodando no computador do OBS. Os dois dispositivos precisam estar na mesma rede.</p>
    {notice && <div className={`notice ${notice.kind}`}>{notice.text}</div>}
    <form onSubmit={onSubmit}><div className="address-row"><label>IP do computador<input autoFocus required value={draft.host} placeholder="192.168.1.20" onChange={event => setDraft({...draft, host: event.target.value})} /></label><label className="port">Porta<input required type="number" min="1" max="65535" value={draft.port} onChange={event => setDraft({...draft, port: Number(event.target.value)})} /></label></div><label>Token da API<input required type="password" value={draft.token} placeholder="Cole o token exibido no servidor" onChange={event => setDraft({...draft, token: event.target.value})} /></label><label className="remember"><input type="checkbox" checked={remember} onChange={event => setRemember(event.target.checked)} /><span>Lembrar o token neste dispositivo</span></label><button className="connect-button" disabled={connecting}>{connecting ? 'Conectando…' : 'Conectar ao servidor'}</button></form>
    <div className="connect-help"><strong>Antes de conectar</strong><ol><li>Ative “Permitir acesso pela rede local” no aplicativo servidor.</li><li>Salve e reinicie o servidor.</li><li>Use o IP local do computador e o token da API.</li></ol></div>
  </section></main>
}

function Status({title, value, active, alert}: {title: string; value: string; active: boolean; alert?: boolean}) { return <article className={`status ${active ? 'active' : ''} ${alert ? 'alert' : ''}`}><span /><div><small>{title}</small><strong>{value}</strong></div></article> }
function PanelHeading({title, count}: {title: string; count: number}) { return <div className="panel-heading"><h2>{title}</h2><span>{count}</span></div> }
function Empty({text}: {text: string}) { return <div className="empty">{text}</div> }
function eventLabel(type: string) { return type.replace(/^obs\.event\./, '').replace(/^obs\./, '').replaceAll('.', ' · ') }

export default App
