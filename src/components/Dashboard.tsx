import {CSSProperties, memo, PointerEvent, useEffect, useRef, useState} from 'react'
import {ContactFooter} from './ContactFooter'
import {DashboardProps} from './types'

function DashboardComponent({address, data, eventOnline, busy, notice, dismissNotice, disconnect, runAction, setScene, setSourceVisible, setRecording, setStreaming, setAudio, setPreviewScene, transition, refreshDiagnostics, fetchPreview, activeSection: tab, setActiveSection}: DashboardProps) {
  const {status, scenes, sources} = data
  const [criticalAction, setCriticalAction] = useState<'recording' | 'streaming' | null>(null)
  const commandId = () => globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`
  const confirmCritical = () => {
    if (!criticalAction) return
    const streaming = criticalAction === 'streaming'
    void runAction(criticalAction, () => streaming ? setStreaming(false, commandId()) : setRecording(false, commandId()), streaming ? 'Transmissão encerrada e confirmada pelo OBS.' : 'Gravação encerrada e confirmada pelo OBS.')
    setCriticalAction(null)
  }
  return <div className="app-shell">
    <header className="topbar">
      <div className="identity"><span className="logo"><img src="/logo.png" alt="" /></span><div><strong>OBS Remote Deck</strong><small>{address}</small></div></div>
      <div className="connection"><span className={eventOnline ? 'signal online' : 'signal'} />{eventOnline ? 'Tempo real' : 'Polling ativo'}<button onClick={disconnect}>Trocar servidor</button></div>
    </header>
    <main className="dashboard">
      <div className="page-heading"><div><p>CONTROLE REMOTO</p><h1>Painel do OBS</h1></div><div className={`obs-state ${status.connected ? 'online' : ''}`}><span />{status.connected ? 'OBS conectado' : 'OBS desconectado'}</div></div>
      <nav className="deck-nav" aria-label="Seções do painel">{([['control', 'Controle'], ['health', 'Saúde'], ['audio', 'Áudio'], ['studio', 'Studio'], ['diagnostics', 'Diagnóstico']] as const).map(([id, label]) => <button key={id} className={tab === id ? 'active' : ''} onClick={() => setActiveSection(id)}>{label}</button>)}</nav>
      {tab === 'control' && <><StatusStrip status={status} eventOnline={eventOnline} />
      <OutputControls status={status} busy={busy} runAction={runAction} setRecording={setRecording} setStreaming={setStreaming} requestCritical={setCriticalAction} commandId={commandId} />
      <div className="workspace">
        <ProgramPreview sceneName={status.currentScene} connected={status.connected} fetchPreview={fetchPreview} />
        <ScenesPanel scenes={scenes} currentScene={status.currentScene} busy={busy} runAction={runAction} setScene={setScene} />
        <SourcesPanel sources={sources} busy={busy} runAction={runAction} setSourceVisible={setSourceVisible} />
      </div></>}
      {tab === 'health' && <HealthScreen telemetry={data.telemetry} />}
      {tab === 'audio' && <AudioScreen inputs={data.audio} busy={busy} runAction={runAction} setAudio={setAudio} commandId={commandId} />}
      {tab === 'studio' && <StudioScreen studio={data.studio} scenes={scenes} busy={busy} runAction={runAction} setPreviewScene={setPreviewScene} transition={transition} commandId={commandId} />}
      {tab === 'diagnostics' && <DiagnosticsScreen diagnostics={data.diagnostics} refresh={refreshDiagnostics} />}
      <ContactFooter />
    </main>
    {notice && <div className={`toast ${notice.kind}`} role="status"><span>{notice.text}</span><button onClick={dismissNotice}>×</button></div>}
    {criticalAction && <CriticalConfirmation action={criticalAction} onCancel={() => setCriticalAction(null)} onConfirm={confirmCritical} />}
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
        schedule(Math.max(1000, 1000 - elapsed))
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

const OutputControls = memo(function OutputControls({status, busy, runAction, setRecording, setStreaming, requestCritical, commandId}: Pick<DashboardProps, 'busy' | 'runAction' | 'setRecording' | 'setStreaming'> & {status: DashboardProps['data']['status']; requestCritical: (value: 'recording' | 'streaming') => void; commandId: () => string}) {
  return <section className="output-controls">
    <button className={status.recording ? 'stop active' : 'record'} disabled={!status.connected || !!busy} onClick={() => status.recording ? requestCritical('recording') : runAction('recording', () => setRecording(true, commandId()), 'Gravação iniciada e confirmada pelo OBS.')}><span>{status.recording ? '■' : '●'}</span><div><strong>{busy === 'recording' ? 'Enviando…' : status.recording ? 'Parar gravação' : 'Iniciar gravação'}</strong><small>{busy === 'recording' ? 'Aguardando confirmação' : 'Arquivo local do OBS'}</small></div></button>
    <button className={status.streaming ? 'stop active' : 'stream'} disabled={!status.connected || !!busy} onClick={() => status.streaming ? requestCritical('streaming') : runAction('streaming', () => setStreaming(true, commandId()), 'Transmissão iniciada e confirmada pelo OBS.')}><span>{status.streaming ? '■' : '◉'}</span><div><strong>{busy === 'streaming' ? 'Enviando…' : status.streaming ? 'Parar transmissão' : 'Iniciar transmissão'}</strong><small>{busy === 'streaming' ? 'Aguardando confirmação' : 'Saída configurada no OBS'}</small></div></button>
  </section>
})

const ScenesPanel = memo(function ScenesPanel({scenes, currentScene, busy, runAction, setScene}: {scenes: DashboardProps['data']['scenes']; currentScene: string} & Pick<DashboardProps, 'busy' | 'runAction' | 'setScene'>) {
  return <section className="panel scenes-panel"><PanelHeading title="Cenas" count={scenes.length} /><div className="scene-grid">{scenes.map(scene => <button key={scene.name} className={scene.name === currentScene ? 'selected' : ''} disabled={!!busy} onClick={() => runAction('scene', () => setScene(scene.name), `Cena alterada para “${scene.name}”.`)}><span>{scene.name.slice(0, 2).toUpperCase()}</span><strong>{scene.name}</strong>{scene.name === currentScene && <em>NO AR</em>}</button>)}{!scenes.length && <Empty text="Nenhuma cena disponível" />}</div></section>
})

const SourcesPanel = memo(function SourcesPanel({sources, busy, runAction, setSourceVisible}: {sources: DashboardProps['data']['sources']} & Pick<DashboardProps, 'busy' | 'runAction' | 'setSourceVisible'>) {
  return <section className="panel sources-panel"><PanelHeading title="Fontes da cena" count={sources.length} /><div className="source-list">{sources.map(source => <div className="source" key={`${source.sceneName}:${source.id}`}><button className={source.enabled ? 'eye visible' : 'eye'} disabled={!!busy} aria-label={source.enabled ? 'Ocultar fonte' : 'Mostrar fonte'} onClick={() => runAction('source', () => setSourceVisible(source.sceneName, source.name, !source.enabled), `Fonte “${source.name}” ${source.enabled ? 'ocultada' : 'exibida'}.`)}>{source.enabled ? '●' : '○'}</button><strong>{source.name}</strong><span>{source.enabled ? 'Visível' : 'Oculta'}</span></div>)}{!sources.length && <Empty text="Nenhuma fonte na cena atual" />}</div></section>
})

function HealthScreen({telemetry}: {telemetry: DashboardProps['data']['telemetry']}) {
  if (!telemetry) return <section className="screen-empty">Sem dados de telemetria. Atualize o OBS Control Server para acompanhar a saúde da transmissão.</section>
  const renderLoss = telemetry.renderTotalFrames ? telemetry.renderSkippedFrames / telemetry.renderTotalFrames * 100 : 0
  const outputLoss = telemetry.outputTotalFrames ? telemetry.outputSkippedFrames / telemetry.outputTotalFrames * 100 : 0
  const cards = [
    ['Live', duration(telemetry.streamDurationMs), telemetry.streaming ? 'healthy' : 'no-data'], ['Gravação', duration(telemetry.recordDurationMs), telemetry.recording ? 'healthy' : 'no-data'],
    ['Bitrate estimado', `${Math.round(telemetry.streamBytes * 8 / Math.max(1, telemetry.streamDurationMs) / 1000)} kb/s`, 'healthy'], ['Congestionamento', `${telemetry.streamCongestion.toFixed(1)}%`, telemetry.streamCongestion > 5 ? 'attention' : 'healthy'],
    ['FPS real', telemetry.activeFps.toFixed(1), telemetry.activeFps < 25 ? 'attention' : 'healthy'], ['CPU do OBS', `${telemetry.cpuUsage.toFixed(1)}%`, telemetry.cpuUsage > 80 ? 'critical' : telemetry.cpuUsage > 60 ? 'attention' : 'healthy'],
    ['Frames perdidos na renderização', `${renderLoss.toFixed(2)}%`, renderLoss > 2 ? 'critical' : renderLoss > .5 ? 'attention' : 'healthy'], ['Frames perdidos na saída', `${outputLoss.toFixed(2)}%`, outputLoss > 2 ? 'critical' : outputLoss > .5 ? 'attention' : 'healthy'],
    ['Renderização média', `${telemetry.averageFrameRenderTime.toFixed(2)} ms`, telemetry.averageFrameRenderTime > 25 ? 'attention' : 'healthy'],
  ] as const
  return <section className="health-grid">{cards.map(([title, value, state]) => <article key={title} className={`metric ${state}`}><small>{title}</small><strong>{value}</strong><span>{state === 'healthy' ? 'Saudável' : state === 'no-data' ? 'Sem dados' : state === 'attention' ? 'Atenção' : 'Crítico'}</span></article>)}<p className="screen-note">Os limites são um ponto de partida. Ajuste-os à qualidade e ao bitrate definidos para sua transmissão.</p></section>
}

function AudioScreen({inputs, busy, runAction, setAudio, commandId}: {inputs: DashboardProps['data']['audio']; busy: string; runAction: DashboardProps['runAction']; setAudio: DashboardProps['setAudio']; commandId: () => string}) {
  const [favorites, setFavorites] = useState<string[]>(() => JSON.parse(localStorage.getItem('obs-control-web.audio-favorites') || '[]') as string[])
  const toggleFavorite = (name: string) => setFavorites(current => { const next = current.includes(name) ? current.filter(item => item !== name) : [...current, name]; localStorage.setItem('obs-control-web.audio-favorites', JSON.stringify(next)); return next })
  if (!inputs.length) return <section className="screen-empty">Nenhuma entrada de áudio disponível ou o OBS ainda não forneceu os dados.</section>
  return <section className="audio-list">{[...inputs].sort((a, b) => Number(favorites.includes(b.name)) - Number(favorites.includes(a.name))).map(input => <AudioRow key={input.name} input={input} favorite={favorites.includes(input.name)} busy={busy} onFavorite={() => toggleFavorite(input.name)} runAction={runAction} setAudio={setAudio} commandId={commandId} />)}</section>
}

function AudioRow({input, favorite, busy, onFavorite, runAction, setAudio, commandId}: {input: NonNullable<DashboardProps['data']['audio']>[number]; favorite: boolean; busy: string; onFavorite: () => void; runAction: DashboardProps['runAction']; setAudio: DashboardProps['setAudio']; commandId: () => string}) {
  const timer = useRef(0)
  const [volume, setVolume] = useState(input.volumeDb)
  useEffect(() => setVolume(input.volumeDb), [input.volumeDb])
  const changeVolume = (value: number) => { setVolume(value); window.clearTimeout(timer.current); timer.current = window.setTimeout(() => void runAction(`audio:${input.name}`, () => setAudio(input.name, {volumeDb: value}, commandId()), `Volume de “${input.name}” confirmado.`), 250) }
  return <article className="audio-row"><button className="favorite" onClick={onFavorite} aria-label="Alternar favorito">{favorite ? '★' : '☆'}</button><div><strong>{input.name}</strong><small>{input.kind || 'Entrada de áudio'} · {input.levelStatus}</small></div><div className={`audio-meter ${input.levelStatus.replace(' ', '-')}`}><span style={{width: `${Math.max(0, Math.min(100, (input.levelDb + 60) / 60 * 100))}%`}} /></div><label className="volume"><input type="range" min="-60" max="0" step="0.5" value={volume} disabled={!!busy} onChange={event => changeVolume(Number(event.target.value))} /><output>{volume.toFixed(1)} dB</output></label><button className={input.muted ? 'mute muted' : 'mute'} disabled={!!busy} onClick={() => void runAction(`audio:${input.name}`, () => setAudio(input.name, {muted: !input.muted}, commandId()), input.muted ? `“${input.name}” reativado.` : `“${input.name}” silenciado.`)}>{input.muted ? 'Reativar' : 'Silenciar'}</button></article>
}

function StudioScreen({studio, scenes, busy, runAction, setPreviewScene, transition, commandId}: {studio: DashboardProps['data']['studio']; scenes: DashboardProps['data']['scenes']; busy: string; runAction: DashboardProps['runAction']; setPreviewScene: DashboardProps['setPreviewScene']; transition: DashboardProps['transition']; commandId: () => string}) {
  const [durationMs, setDurationMs] = useState(studio?.transitionDuration || 300)
  useEffect(() => setDurationMs(studio?.transitionDuration || 300), [studio?.transitionDuration])
  if (!studio?.enabled) return <section className="screen-empty">O Modo Studio está desativado no OBS. Ative-o no OBS para separar a prévia da cena no ar e evitar cortes diretos.</section>
  return <section className="studio-screen"><div className="studio-cards"><article><small>PROGRAMA · NO AR</small><strong>{studio.programScene || 'Indisponível'}</strong></article><article className="preview"><small>PRÉVIA · PRÓXIMA CENA</small><strong>{studio.previewScene || 'Selecione uma cena'}</strong></article></div><section className="panel"><div className="panel-heading"><h2>Selecionar prévia</h2><span>{scenes.length}</span></div><div className="scene-grid">{scenes.map(scene => <button key={scene.name} className={scene.name === studio.previewScene ? 'selected' : ''} disabled={!!busy} onClick={() => void runAction('studio-preview', () => setPreviewScene(scene.name, commandId()), `Prévia alterada para “${scene.name}”.`)}><span>{scene.name.slice(0, 2).toUpperCase()}</span><strong>{scene.name}</strong></button>)}</div></section><div className="transition-bar"><label>Duração <input type="number" min="50" max="20000" value={durationMs} onChange={event => setDurationMs(Number(event.target.value))} /> ms</label><button disabled={!!busy || !studio.previewScene} onClick={() => void runAction('studio-transition', () => transition(durationMs, commandId()), 'Transição executada e confirmada pelo OBS.')}>Executar transição</button></div></section>
}

function DiagnosticsScreen({diagnostics, refresh}: {diagnostics: DashboardProps['data']['diagnostics']; refresh: () => Promise<void>}) {
  const exportReport = () => { if (!diagnostics) return; const blob = new Blob([JSON.stringify(diagnostics, null, 2)], {type:'application/json'}); const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = `obs-diagnostico-${new Date().toISOString().slice(0, 10)}.json`; link.click(); URL.revokeObjectURL(link.href) }
  return <section className="diagnostics"><div className="diagnostics-actions"><p>Relatório sem tokens, senhas ou dados de conexão salvos.</p><button onClick={() => void refresh()}>Atualizar</button><button onClick={exportReport} disabled={!diagnostics}>Exportar relatório</button></div>{diagnostics?.links.map(link => <article key={link.id} className={`diagnostic-link ${link.state}`}><span /><div><strong>{link.label}</strong><small>Última comunicação: {new Date(link.lastSeen).toLocaleString('pt-BR')}</small></div><p>{link.message}</p></article>) || <div className="screen-empty">Diagnóstico indisponível. Atualize o servidor e tente novamente.</div>}</section>
}

function CriticalConfirmation({action, onCancel, onConfirm}: {action: 'recording' | 'streaming'; onCancel: () => void; onConfirm: () => void}) {
  const [progress, setProgress] = useState(0); const started = useRef(0); const frame = useRef(0)
  const finish = () => { cancelAnimationFrame(frame.current); setProgress(0) }
  const hold = (event: PointerEvent<HTMLButtonElement>) => { event.currentTarget.setPointerCapture(event.pointerId); started.current = performance.now(); const tick = () => { const value = Math.min(1, (performance.now() - started.current) / 1200); setProgress(value); if (value >= 1) { onConfirm(); return } frame.current = requestAnimationFrame(tick) }; frame.current = requestAnimationFrame(tick) }
  return <div className="confirm-backdrop" role="dialog" aria-modal="true"><section className="confirm-dialog"><p>AÇÃO CRÍTICA</p><h2>Parar {action === 'streaming' ? 'a transmissão' : 'a gravação'}?</h2><span>Pressione e segure para confirmar. Isso evita toques acidentais durante a live.</span><button className="hold-confirm" style={{'--progress': `${progress * 100}%`} as CSSProperties} onPointerDown={hold} onPointerUp={finish} onPointerCancel={finish}>Segure para confirmar</button><button className="cancel" onClick={onCancel}>Cancelar</button></section></div>
}

function duration(milliseconds: number) { const seconds = Math.floor(milliseconds / 1000); return `${String(Math.floor(seconds / 3600)).padStart(2, '0')}:${String(Math.floor(seconds / 60) % 60).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}` }

function Status({title, value, active, alert}: {title: string; value: string; active: boolean; alert?: boolean}) { return <article className={`status ${active ? 'active' : ''} ${alert ? 'alert' : ''}`}><span /><div><small>{title}</small><strong>{value}</strong></div></article> }
function PanelHeading({title, count}: {title: string; count: number}) { return <div className="panel-heading"><h2>{title}</h2><span>{count}</span></div> }
function Empty({text}: {text: string}) { return <div className="empty">{text}</div> }
export const Dashboard = memo(DashboardComponent)
