import {memo, useEffect, useRef, useState} from 'react'
import {DashboardProps} from './types'

function DashboardComponent({address, data, events, eventOnline, busy, notice, dismissNotice, disconnect, runAction, setScene, setSourceVisible, setRecording, setStreaming, fetchPreview}: DashboardProps) {
  const {status, scenes, sources} = data
  return <div className="app-shell">
    <header className="topbar">
      <div className="identity"><span className="logo">OC</span><div><strong>OBS Remote</strong><small>{address}</small></div></div>
      <div className="connection"><span className={eventOnline ? 'signal online' : 'signal'} />{eventOnline ? 'Tempo real' : 'Polling ativo'}<button onClick={disconnect}>Trocar servidor</button></div>
    </header>
    <main className="dashboard">
      <div className="page-heading"><div><p>CONTROLE REMOTO</p><h1>Painel do OBS</h1></div><div className={`obs-state ${status.connected ? 'online' : ''}`}><span />{status.connected ? 'OBS conectado' : 'OBS desconectado'}</div></div>
      <StatusStrip status={status} eventOnline={eventOnline} />
      <OutputControls status={status} busy={busy} runAction={runAction} setRecording={setRecording} setStreaming={setStreaming} />
      <div className="workspace">
        <ProgramPreview sceneName={status.currentScene} connected={status.connected} fetchPreview={fetchPreview} />
        <ScenesPanel scenes={scenes} currentScene={status.currentScene} busy={busy} runAction={runAction} setScene={setScene} />
        <SourcesPanel sources={sources} busy={busy} runAction={runAction} setSourceVisible={setSourceVisible} />
        <EventsPanel events={events} />
      </div>
    </main>
    {notice && <div className={`toast ${notice.kind}`} role="status"><span>{notice.text}</span><button onClick={dismissNotice}>×</button></div>}
  </div>
}

const ProgramPreview = memo(function ProgramPreview({sceneName, connected, fetchPreview}: {sceneName: string; connected: boolean; fetchPreview: DashboardProps['fetchPreview']}) {
  const [imageURL, setImageURL] = useState('')
  const [unavailable, setUnavailable] = useState(false)
  const currentURL = useRef('')

  useEffect(() => {
    let cancelled = false
    let timer = 0
    let failures = 0
    let fastFrames = 0
    let profile = {width: window.innerWidth <= 560 ? 480 : 640, quality: window.innerWidth <= 560 ? 42 : 50}

    const schedule = (delay: number) => {
      if (!cancelled) timer = window.setTimeout(update, delay)
    }
    const update = async () => {
      if (!connected || !sceneName || document.hidden) {
        schedule(1000)
        return
      }
      const startedAt = performance.now()
      try {
        const blob = await fetchPreview(sceneName, profile.width, profile.quality)
        const nextURL = URL.createObjectURL(blob)
        const decoded = new Image()
        decoded.src = nextURL
        await decoded.decode()
        if (cancelled) {
          URL.revokeObjectURL(nextURL)
          return
        }
        const previousURL = currentURL.current
        currentURL.current = nextURL
        setImageURL(nextURL)
        setUnavailable(false)
        if (previousURL) URL.revokeObjectURL(previousURL)
        const elapsed = performance.now() - startedAt
        failures = 0
        if (elapsed > 900 || blob.size > 180_000) {
          profile = {width: 480, quality: 42}
          fastFrames = 0
        } else if (elapsed < 350 && blob.size < 120_000 && ++fastFrames >= 5) {
          profile = {width: 640, quality: 50}
        }
        schedule(Math.max(120, 600 - elapsed))
      } catch {
        if (cancelled) return
        failures++
        setUnavailable(true)
        schedule(Math.min(5000, 1000 * failures))
      }
    }
    void update()
    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [connected, fetchPreview, sceneName])

  useEffect(() => () => {
    if (currentURL.current) URL.revokeObjectURL(currentURL.current)
  }, [])

  return <section className="panel preview-panel">
    <div className="panel-heading"><h2>Pré-visualização do programa</h2><span className="live-label">NO AR</span></div>
    <div className="program-preview">
      {imageURL && <img src={imageURL} alt={`Saída atual do OBS: ${sceneName}`} />}
      {!imageURL && <div className="preview-placeholder">{connected ? 'Carregando prévia…' : 'OBS desconectado'}</div>}
      {unavailable && <div className="preview-warning">Prévia temporariamente indisponível</div>}
      <div className="preview-scene"><span />{sceneName || 'Sem cena no ar'}</div>
    </div>
  </section>
})

const StatusStrip = memo(function StatusStrip({status, eventOnline}: {status: DashboardProps['data']['status']; eventOnline: boolean}) {
  return <section className="status-strip">
    <Status title="Cena no ar" value={status.currentScene || 'Indisponível'} active={status.connected} />
    <Status title="Gravação" value={status.recording ? 'GRAVANDO' : 'Parada'} active={status.recording} alert={status.recording} />
    <Status title="Transmissão" value={status.streaming ? 'AO VIVO' : 'Offline'} active={status.streaming} alert={status.streaming} />
    <Status title="Eventos" value={eventOnline ? 'Conectado' : 'Reconectando'} active={eventOnline} />
  </section>
})

const OutputControls = memo(function OutputControls({status, busy, runAction, setRecording, setStreaming}: Pick<DashboardProps, 'busy' | 'runAction' | 'setRecording' | 'setStreaming'> & {status: DashboardProps['data']['status']}) {
  return <section className="output-controls">
    <button className={status.recording ? 'stop active' : 'record'} disabled={!status.connected || !!busy} onClick={() => runAction('recording', () => setRecording(!status.recording), status.recording ? 'Gravação encerrada.' : 'Gravação iniciada.')}><span>{status.recording ? '■' : '●'}</span><div><strong>{status.recording ? 'Parar gravação' : 'Iniciar gravação'}</strong><small>Arquivo local do OBS</small></div></button>
    <button className={status.streaming ? 'stop active' : 'stream'} disabled={!status.connected || !!busy} onClick={() => runAction('streaming', () => setStreaming(!status.streaming), status.streaming ? 'Transmissão encerrada.' : 'Transmissão iniciada.')}><span>{status.streaming ? '■' : '◉'}</span><div><strong>{status.streaming ? 'Parar transmissão' : 'Iniciar transmissão'}</strong><small>Saída configurada no OBS</small></div></button>
  </section>
})

const ScenesPanel = memo(function ScenesPanel({scenes, currentScene, busy, runAction, setScene}: {scenes: DashboardProps['data']['scenes']; currentScene: string} & Pick<DashboardProps, 'busy' | 'runAction' | 'setScene'>) {
  return <section className="panel scenes-panel"><PanelHeading title="Cenas" count={scenes.length} /><div className="scene-grid">{scenes.map(scene => <button key={scene.name} className={scene.name === currentScene ? 'selected' : ''} disabled={!!busy} onClick={() => runAction('scene', () => setScene(scene.name), `Cena alterada para “${scene.name}”.`)}><span>{scene.name.slice(0, 2).toUpperCase()}</span><strong>{scene.name}</strong>{scene.name === currentScene && <em>NO AR</em>}</button>)}{!scenes.length && <Empty text="Nenhuma cena disponível" />}</div></section>
})

const SourcesPanel = memo(function SourcesPanel({sources, busy, runAction, setSourceVisible}: {sources: DashboardProps['data']['sources']} & Pick<DashboardProps, 'busy' | 'runAction' | 'setSourceVisible'>) {
  return <section className="panel sources-panel"><PanelHeading title="Fontes da cena" count={sources.length} /><div className="source-list">{sources.map(source => <div className="source" key={`${source.sceneName}:${source.id}`}><button className={source.enabled ? 'eye visible' : 'eye'} disabled={!!busy} aria-label={source.enabled ? 'Ocultar fonte' : 'Mostrar fonte'} onClick={() => runAction('source', () => setSourceVisible(source.sceneName, source.name, !source.enabled), `Fonte “${source.name}” ${source.enabled ? 'ocultada' : 'exibida'}.`)}>{source.enabled ? '●' : '○'}</button><strong>{source.name}</strong><span>{source.enabled ? 'Visível' : 'Oculta'}</span></div>)}{!sources.length && <Empty text="Nenhuma fonte na cena atual" />}</div></section>
})

const EventsPanel = memo(function EventsPanel({events}: Pick<DashboardProps, 'events'>) {
  return <section className="panel events-panel"><PanelHeading title="Atividade recente" count={events.length} /><div className="event-list">{events.map(event => <div className="event" key={event.id}><time>{new Date(event.time).toLocaleTimeString('pt-BR')}</time><span>{eventLabel(event.type)}</span></div>)}{!events.length && <Empty text="Aguardando eventos em tempo real" />}</div></section>
})

function Status({title, value, active, alert}: {title: string; value: string; active: boolean; alert?: boolean}) { return <article className={`status ${active ? 'active' : ''} ${alert ? 'alert' : ''}`}><span /><div><small>{title}</small><strong>{value}</strong></div></article> }
function PanelHeading({title, count}: {title: string; count: number}) { return <div className="panel-heading"><h2>{title}</h2><span>{count}</span></div> }
function Empty({text}: {text: string}) { return <div className="empty">{text}</div> }
function eventLabel(type: string) { return type.replace(/^obs\.event\./, '').replace(/^obs\./, '').replaceAll('.', ' · ') }

export const Dashboard = memo(DashboardComponent)
