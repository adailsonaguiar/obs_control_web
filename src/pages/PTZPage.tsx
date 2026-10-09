import {FormEvent, PointerEvent, useEffect, useMemo, useRef, useState} from 'react'
import {ConnectionSettings, OBSControlAPI} from '../api'

type Notice = {kind: 'success' | 'error'; text: string}
type Preset = {id: string; name: string; number: number}
type Camera = {id: string; name: string; host: string; port: number; snapshotUrl: string; obsSceneName?: string; presets: Preset[]}
type MobilePanel = 'cameras' | 'control' | 'presets'
type ControlMode = 'arrows' | 'joystick' | 'both'
type AxisLock = 'free' | 'horizontal' | 'vertical'

export function constrainJoystickVector(x: number, y: number, axisLock: AxisLock) {
  if (axisLock === 'horizontal') return {x, y: 0}
  if (axisLock === 'vertical') return {x: 0, y}
  return {x, y}
}

const CAMERAS_KEY = 'obs-control.ptz-cameras.v1'
const SERVER_KEY = 'obs-control.ptz-server.v1'
const CONTROL_MODE_KEY = 'obs-control.ptz-control-mode.v1'
const JOYSTICK_TUNING_KEY = 'obs-control.ptz-joystick-tuning.v1'

function readControlMode(fallback: Exclude<ControlMode, 'both'>): ControlMode {
  const saved = localStorage.getItem(CONTROL_MODE_KEY)
  return saved === 'arrows' || saved === 'joystick' || saved === 'both' ? saved : fallback
}

function readJoystickTuning() {
  try {
    const saved = JSON.parse(localStorage.getItem(JOYSTICK_TUNING_KEY) || '{}') as {speed?: number; sensitivity?: number; axisLock?: AxisLock}
    return {
      speed: saved.speed && saved.speed >= 1 && saved.speed <= 24 ? saved.speed : 8,
      sensitivity: saved.sensitivity && saved.sensitivity >= 50 && saved.sensitivity <= 150 ? saved.sensitivity : 100,
      axisLock: saved.axisLock === 'horizontal' || saved.axisLock === 'vertical' ? saved.axisLock : 'free' as AxisLock,
    }
  } catch { return {speed: 8, sensitivity: 100, axisLock: 'free' as AxisLock} }
}

function readCameras(): Camera[] {
  try {
    const value = JSON.parse(localStorage.getItem(CAMERAS_KEY) || '[]') as Camera[]
    return Array.isArray(value) ? value.filter(camera => camera.id && camera.host) : []
  } catch { return [] }
}

function readServer(): ConnectionSettings {
  try {
    const saved = JSON.parse(localStorage.getItem(SERVER_KEY) || '{}') as Partial<ConnectionSettings>
    return {host: saved.host || '127.0.0.1', port: saved.port || 3456, token: sessionStorage.getItem(`${SERVER_KEY}.token`) || ''}
  } catch { return {host: '127.0.0.1', port: 3456, token: ''} }
}

function makeId() { return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}` }

export function PTZPage({mode}: {mode: 'arrows' | 'joystick'}) {
  const initialCameras = useMemo(readCameras, [])
  const initialTuning = useMemo(readJoystickTuning, [])
  const [server, setServer] = useState(readServer)
  const [cameras, setCameras] = useState(initialCameras)
  const [selectedId, setSelectedId] = useState(initialCameras[0]?.id || '')
  const [speed, setSpeed] = useState(initialTuning.speed)
  const [sensitivity, setSensitivity] = useState(initialTuning.sensitivity)
  const [axisLock, setAxisLock] = useState<AxisLock>(initialTuning.axisLock)
  const [controlMode, setControlMode] = useState<ControlMode>(() => readControlMode(mode))
  const [notice, setNotice] = useState<Notice | null>(null)
  const [logs, setLogs] = useState<string[]>(['Console pronta. Cadastre ou selecione uma câmera.'])
  const [cameraEditor, setCameraEditor] = useState<Camera | 'new' | null>(null)
  const [presetEditor, setPresetEditor] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [obsPreviewUrl, setOBSPreviewUrl] = useState('')
  const [previewState, setPreviewState] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle')
  const [mobilePanel, setMobilePanel] = useState<MobilePanel>(mode === 'joystick' ? 'control' : 'cameras')
  const client = useMemo(() => new OBSControlAPI(server), [server])
  const camera = cameras.find(item => item.id === selectedId) || cameras[0]

  useEffect(() => localStorage.setItem(CAMERAS_KEY, JSON.stringify(cameras)), [cameras])
  useEffect(() => localStorage.setItem(CONTROL_MODE_KEY, controlMode), [controlMode])
  useEffect(() => localStorage.setItem(JOYSTICK_TUNING_KEY, JSON.stringify({speed, sensitivity, axisLock})), [speed, sensitivity, axisLock])
  useEffect(() => {
    localStorage.setItem(SERVER_KEY, JSON.stringify({host: server.host, port: server.port}))
    sessionStorage.setItem(`${SERVER_KEY}.token`, server.token)
  }, [server])
  useEffect(() => { if (!camera && selectedId) setSelectedId('') }, [camera, selectedId])
  useEffect(() => {
    let active = true
    let refreshTimer = 0
    let currentObjectUrl = ''
    const sceneName = camera?.obsSceneName?.trim()

    setOBSPreviewUrl('')
    if (!sceneName) {
      setPreviewState('idle')
      return () => undefined
    }

    setPreviewState('loading')
    const refresh = async () => {
      try {
        const image = await client.preview(sceneName, 960, 55)
        if (!active) return
        const nextObjectUrl = URL.createObjectURL(image)
        if (currentObjectUrl) URL.revokeObjectURL(currentObjectUrl)
        currentObjectUrl = nextObjectUrl
        setOBSPreviewUrl(nextObjectUrl)
        setPreviewState('ready')
      } catch {
        if (active) setPreviewState('error')
      } finally {
        if (active) refreshTimer = window.setTimeout(refresh, 1000)
      }
    }
    void refresh()

    return () => {
      active = false
      window.clearTimeout(refreshTimer)
      if (currentObjectUrl) URL.revokeObjectURL(currentObjectUrl)
    }
  }, [camera?.id, camera?.obsSceneName, client])

  function log(message: string) {
    const time = new Intl.DateTimeFormat('pt-BR', {hour: '2-digit', minute: '2-digit', second: '2-digit'}).format(new Date())
    setLogs(current => [`${time}  ${message}`, ...current].slice(0, 40))
  }

  async function send(kind: 'move' | 'zoom', direction: string, speedOverride?: number) {
    if (!camera) return setNotice({kind: 'error', text: 'Selecione uma câmera antes de enviar um comando.'})
    setNotice(null)
    try {
      const commandSpeed = speedOverride ?? speed
      if (kind === 'move') await client.movePTZ(camera.host, camera.port, direction, commandSpeed)
      else await client.zoomPTZ(camera.host, camera.port, direction, Math.min(commandSpeed, 7))
      log(`${kind === 'move' ? 'Movimento' : 'Zoom'}: ${direction} · ${camera.name}`)
    } catch (error) {
      const text = error instanceof Error ? error.message : String(error)
      setNotice({kind: 'error', text}); log(`Falha: ${text}`)
    }
  }

  function hold(kind: 'move' | 'zoom', direction: string) {
    return {
      onPointerDown: (event: PointerEvent<HTMLButtonElement>) => { event.currentTarget.setPointerCapture(event.pointerId); void send(kind, direction) },
      onPointerUp: () => void send(kind, 'stop'),
      onPointerCancel: () => void send(kind, 'stop'),
    }
  }

  function saveCamera(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const next: Camera = {
      id: cameraEditor === 'new' ? makeId() : cameraEditor!.id,
      name: String(data.get('name')).trim(), host: String(data.get('host')).trim(), port: Number(data.get('port')),
      snapshotUrl: String(data.get('snapshotUrl')).trim(), obsSceneName: String(data.get('obsSceneName')).trim(), presets: cameraEditor === 'new' ? [] : cameraEditor!.presets,
    }
    setCameras(current => cameraEditor === 'new' ? [...current, next] : current.map(item => item.id === next.id ? next : item))
    setSelectedId(next.id); setCameraEditor(null); setMobilePanel('control'); log(`${cameraEditor === 'new' ? 'Câmera adicionada' : 'Câmera atualizada'}: ${next.name}`)
  }

  function removeCamera() {
    if (!camera || !window.confirm(`Remover “${camera.name}” e seus presets?`)) return
    const next = cameras.filter(item => item.id !== camera.id)
    setCameras(next); setSelectedId(next[0]?.id || ''); log(`Câmera removida: ${camera.name}`)
  }

  async function savePreset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!camera) return
    const data = new FormData(event.currentTarget)
    const preset: Preset = {id: makeId(), name: String(data.get('name')).trim(), number: Number(data.get('number'))}
    try {
      await client.presetPTZ(camera.host, camera.port, 'save', preset.number)
      setCameras(current => current.map(item => item.id === camera.id ? {...item, presets: [...item.presets.filter(existing => existing.number !== preset.number), preset].sort((a, b) => a.number - b.number)} : item))
      setPresetEditor(false); setNotice({kind: 'success', text: `Preset “${preset.name}” gravado na câmera.`}); log(`Preset ${preset.number} gravado: ${preset.name}`)
    } catch (error) { setNotice({kind: 'error', text: error instanceof Error ? error.message : String(error)}) }
  }

  async function recallPreset(preset: Preset) {
    if (!camera) return
    try {
      await client.presetPTZ(camera.host, camera.port, 'recall', preset.number)
      setNotice({kind: 'success', text: `Chamando “${preset.name}”.`}); log(`Preset ${preset.number} chamado: ${preset.name}`)
    } catch (error) { setNotice({kind: 'error', text: error instanceof Error ? error.message : String(error)}) }
  }

  function removePreset(preset: Preset) {
    if (!camera) return
    setCameras(current => current.map(item => item.id === camera.id ? {...item, presets: item.presets.filter(entry => entry.id !== preset.id)} : item))
    log(`Preset removido da lista: ${preset.name}`)
  }

  useEffect(() => {
    const keyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement) return
      const map: Record<string, string> = {ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right'}
      if (map[event.key]) { event.preventDefault(); void send('move', map[event.key]) }
      else if (/^[1-9]$/.test(event.key) && camera?.presets[Number(event.key) - 1]) void recallPreset(camera.presets[Number(event.key) - 1])
    }
    const keyUp = (event: KeyboardEvent) => { if (event.key.startsWith('Arrow')) void send('move', 'stop') }
    window.addEventListener('keydown', keyDown); window.addEventListener('keyup', keyUp)
    return () => { window.removeEventListener('keydown', keyDown); window.removeEventListener('keyup', keyUp) }
  })

  return <div className="ptz-desk">
    <header className="topbar ptz-shared-header">
      <div className="identity"><a className="logo" href="/" aria-label="Voltar para ferramentas"><img src="/logo.png" alt="" /></a><div><strong>OBS Remote Deck</strong><small>{server.host}:{server.port}</small></div></div>
      <div className="connection"><span className="signal" />{camera?.name || 'Nenhuma câmera'}<button onClick={() => setSettingsOpen(true)}>Trocar servidor</button></div>
    </header>
    <nav className="ptz-mobile-tabs" aria-label="Painéis PTZ">{([['cameras', 'Câmeras'], ['control', 'Controle'], ['presets', 'Presets']] as const).map(([panel, label]) => <button key={panel} className={mobilePanel === panel ? 'active' : ''} onClick={() => setMobilePanel(panel)}>{label}</button>)}</nav>
    {notice && <div className={`ptz-notice ${notice.kind}`}>{notice.text}<button aria-label="Fechar aviso" onClick={() => setNotice(null)}>×</button></div>}

    <main className="ptz-workspace">
      <aside className={`ptz-dock ptz-cameras ${mobilePanel === 'cameras' ? 'mobile-active' : ''}`}>
        <DockTitle title="Câmeras"><button className="ptz-button primary compact" onClick={() => setCameraEditor('new')}><Icon name="plus" /> Nova</button></DockTitle>
        <div className="ptz-dock-body cameras-body">
          <div className="ptz-camera-list">{cameras.map(item => <button key={item.id} className={`ptz-camera-row ${item.id === camera?.id ? 'active' : ''}`} onClick={() => { setSelectedId(item.id); setMobilePanel('control') }}><span className="ptz-status-dot" /><span><strong>{item.name}</strong><small>{item.host}:{item.port} · VISCA UDP</small></span></button>)}</div>
          {!cameras.length && <div className="ptz-empty"><Icon name="camera" /><strong>Nenhuma câmera</strong><span>Adicione seu primeiro dispositivo para começar.</span></div>}
          <div className="ptz-camera-actions"><button disabled={!camera} onClick={() => camera && setCameraEditor(camera)}>Editar</button><button className="danger" disabled={!camera} onClick={removeCamera}>Remover</button></div>
          <div className="ptz-log-title">Registro</div><div className="ptz-log" aria-live="polite">{logs.map((entry, index) => <div key={`${entry}-${index}`}>{entry}</div>)}</div>
        </div>
      </aside>

      <section className={`ptz-stage ${mobilePanel === 'control' ? 'mobile-active' : ''}`}>
        <div className="ptz-preview">
          {obsPreviewUrl ? <img src={obsPreviewUrl} alt={`Prévia de ${camera?.name || 'câmera'} pelo OBS`} /> : camera?.snapshotUrl ? <img src={camera.snapshotUrl} alt={`Prévia de ${camera.name}`} /> : <div className="ptz-preview-empty"><Icon name="camera" /><strong>{previewState === 'loading' ? 'Carregando prévia do OBS' : previewState === 'error' ? 'Prévia do OBS indisponível' : 'Sem imagem de preview'}</strong><span>{previewState === 'error' ? 'Confirme o nome da cena, a conexão com o OBS e a fonte NDI.' : previewState === 'loading' ? 'A primeira imagem pode levar alguns instantes.' : 'Informe uma cena do OBS ou uma URL de snapshot no cadastro da câmera.'}</span></div>}
          <div className="ptz-safe-area" /><span className="ptz-preview-label">{camera ? `${camera.name} · ${camera.host}` : '—'}</span>
          {camera?.obsSceneName && <span className={`ptz-preview-status ${previewState}`} role="status">{previewState === 'ready' ? 'OBS · AO VIVO' : previewState === 'error' ? 'OBS · SEM SINAL' : 'OBS · CONECTANDO'}</span>}
          <div className="ptz-control-overlay" aria-label="Controle PTZ sobre a prévia">
            <div className="ptz-overlay-toolbar"><strong>Controle PTZ</strong><div className="ptz-control-switch" role="group" aria-label="Tipo de controle exibido">{([['arrows', 'Setas'], ['joystick', 'Joystick'], ['both', 'Ambos']] as const).map(([value, label]) => <button key={value} type="button" aria-pressed={controlMode === value} className={controlMode === value ? 'active' : ''} onClick={() => setControlMode(value)}>{label}</button>)}</div><span className="ptz-protocol"><i /> VISCA over IP</span></div>
          <div className={`ptz-control-body mode-${controlMode}`}>{controlMode !== 'joystick' && <div className="ptz-control-column arrows"><p className="ptz-label">Setas direcionais</p><PTZDirectionPad hold={direction => hold('move', direction)} />
            <div className="ptz-button-row"><button {...hold('zoom', 'in')}><Icon name="zoomIn" /> Aproximar</button><button {...hold('zoom', 'out')}><Icon name="zoomOut" /> Afastar</button></div><button className="ptz-stop-button" onClick={() => void send('move', 'stop')}><Icon name="stop" /> Parar movimento</button></div>}
            {controlMode !== 'arrows' && <div className="ptz-control-column joystick"><p className="ptz-label">Joystick / mira</p><div className="ptz-joystick-layout"><PTZJoystick maxSpeed={speed} sensitivity={sensitivity} smoothness={65} axisLock={axisLock} onMove={(direction, nextSpeed) => send('move', direction, nextSpeed)} onStop={() => send('move', 'stop')} />
              <div className="ptz-joystick-tuning"><label><span>Velocidade <strong>{speed}</strong></span><input type="range" min="1" max="24" value={speed} onChange={event => setSpeed(Number(event.target.value))} /></label><label><span>Sensibilidade <strong>{sensitivity}%</strong></span><input type="range" min="50" max="150" value={sensitivity} onChange={event => setSensitivity(Number(event.target.value))} /></label><div className="ptz-axis-control"><span>Travar movimento</span><div role="group" aria-label="Restrição de eixo do joystick">{([['free', 'Livre'], ['horizontal', 'Horizontal'], ['vertical', 'Vertical']] as const).map(([value, label]) => <button key={value} type="button" className={axisLock === value ? 'active' : ''} aria-pressed={axisLock === value} onClick={() => setAxisLock(value)}>{label}</button>)}</div></div></div></div></div>}</div>
          </div>
        </div>
      </section>

      <aside className={`ptz-dock ptz-presets ${mobilePanel === 'presets' ? 'mobile-active' : ''}`}>
        <DockTitle title="Presets"><button className="ptz-button primary compact" disabled={!camera} onClick={() => setPresetEditor(true)}><Icon name="record" /> Gravar</button></DockTitle>
        <div className="ptz-dock-body"><div className="ptz-preset-list">{camera?.presets.map((preset, index) => <div className="ptz-preset" key={preset.id}><button onClick={() => void recallPreset(preset)}><b>{index + 1}</b><span><strong>{preset.name}</strong><small>Memória {preset.number}</small></span></button><button className="ptz-preset-remove" aria-label={`Remover preset ${preset.name}`} onClick={() => removePreset(preset)}><Icon name="close" /></button></div>)}</div>
          {(!camera || !camera.presets.length) && <div className="ptz-empty"><Icon name="bookmark" /><strong>{camera ? 'Sem presets' : 'Selecione uma câmera'}</strong><span>{camera ? 'Grave posições para acessá-las com um toque.' : 'Os presets são individuais por câmera.'}</span></div>}
          <p className="ptz-hint">Clique em um preset para chamá-lo. As teclas 1–9 acionam os presets na ordem da lista.</p></div>
      </aside>
    </main>

    {cameraEditor && <Modal title={cameraEditor === 'new' ? 'Nova câmera' : 'Editar câmera'} onClose={() => setCameraEditor(null)}><form onSubmit={saveCamera} className="ptz-form-dialog">
      <label>Nome<input name="name" required defaultValue={cameraEditor === 'new' ? '' : cameraEditor.name} placeholder="CAM 1 — Palco" /></label>
      <div className="ptz-form-row"><label>IP da câmera<input name="host" required inputMode="decimal" defaultValue={cameraEditor === 'new' ? '' : cameraEditor.host} placeholder="192.168.1.100" /></label><label className="port">Porta<input name="port" required type="number" min="1" max="65535" defaultValue={cameraEditor === 'new' ? 52381 : cameraEditor.port} /></label></div>
      <label>Cena da câmera no OBS <small>Recomendado para NDI</small><input name="obsSceneName" defaultValue={cameraEditor === 'new' ? '' : cameraEditor.obsSceneName || ''} placeholder="CAM 1 — NDI" /></label>
      <label>URL de snapshot / MJPEG <small>Opcional</small><input name="snapshotUrl" type="url" defaultValue={cameraEditor === 'new' ? '' : cameraEditor.snapshotUrl} placeholder="http://192.168.1.100/snapshot.jpg" /></label>
      <p>A cena do OBS usa a fonte NDI já configurada no Studio e não depende do RTMP. Os dados ficam salvos somente neste navegador.</p><ModalActions onCancel={() => setCameraEditor(null)} submit="Salvar câmera" />
    </form></Modal>}
    {presetEditor && camera && <Modal title="Gravar preset" onClose={() => setPresetEditor(false)}><form onSubmit={savePreset} className="ptz-form-dialog"><label>Nome<input name="name" required autoFocus placeholder="Plano geral" /></label><label>Memória da câmera<input name="number" required type="number" min="0" max="255" defaultValue={camera.presets.length + 1} /></label><p>A posição atual de pan, tilt e zoom será gravada diretamente na memória da câmera.</p><ModalActions onCancel={() => setPresetEditor(false)} submit="Gravar posição" /></form></Modal>}
    {settingsOpen && <Modal title="Conexão com o servidor" onClose={() => setSettingsOpen(false)}><form className="ptz-form-dialog" onSubmit={event => { event.preventDefault(); setSettingsOpen(false); setNotice({kind: 'success', text: 'Configuração do servidor atualizada.'}) }}><label>IP do servidor<input value={server.host} onChange={event => setServer({...server, host: event.target.value})} /></label><label>Porta<input type="number" min="1" max="65535" value={server.port} onChange={event => setServer({...server, port: Number(event.target.value)})} /></label><label>Token da API<input type="password" value={server.token} onChange={event => setServer({...server, token: event.target.value})} /></label><p>O token permanece apenas nesta sessão do navegador.</p><ModalActions onCancel={() => setSettingsOpen(false)} submit="Concluir" /></form></Modal>}
  </div>
}

function DockTitle({title, children}: {title: string; children?: React.ReactNode}) { return <div className="ptz-dock-title"><span>{title}</span><div>{children}</div></div> }
function ModalActions({onCancel, submit}: {onCancel: () => void; submit: string}) { return <div className="ptz-modal-actions"><button type="button" onClick={onCancel}>Cancelar</button><button className="primary" type="submit">{submit}</button></div> }
function Modal({title, onClose, children}: {title: string; onClose: () => void; children: React.ReactNode}) { return <div className="ptz-modal-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) onClose() }}><section className="ptz-modal" role="dialog" aria-modal="true" aria-labelledby="ptz-modal-title"><header><h2 id="ptz-modal-title">{title}</h2><button aria-label="Fechar" onClick={onClose}><Icon name="close" /></button></header>{children}</section></div> }

const directions = [['up-left', -45, 'Mover para cima e esquerda'], ['up', 0, 'Mover para cima'], ['up-right', 45, 'Mover para cima e direita'], ['left', -90, 'Mover para esquerda'], ['stop', 0, 'Parar movimento'], ['right', 90, 'Mover para direita'], ['down-left', -135, 'Mover para baixo e esquerda'], ['down', 180, 'Mover para baixo'], ['down-right', 135, 'Mover para baixo e direita']] as const
function PTZDirectionPad({hold}: {hold: (direction: string) => HoldHandlers}) { return <div className="ptz-pad" aria-label="Controle direcional">{directions.map(([direction, rotation, name]) => <button key={direction} type="button" className={direction === 'stop' ? 'stop' : ''} aria-label={name} title={name} {...hold(direction)}>{direction === 'stop' ? <Icon name="stop" /> : <Icon name="arrow" rotation={rotation} />}</button>)}</div> }
type HoldHandlers = {onPointerDown: (event: PointerEvent<HTMLButtonElement>) => void; onPointerUp: () => void; onPointerCancel: () => void}

function PTZJoystick({maxSpeed, sensitivity, smoothness, axisLock, onMove, onStop}: {maxSpeed: number; sensitivity: number; smoothness: number; axisLock: AxisLock; onMove: (direction: string, speed: number) => void; onStop: () => void}) {
  const field = useRef<HTMLDivElement>(null), lastCommand = useRef({direction: '', speed: 0, time: 0}), target = useRef({x: 0, y: 0}), current = useRef({x: 0, y: 0}), radius = useRef(1), animation = useRef<number | null>(null)
  const [position, setPosition] = useState({x: 0, y: 0}), [dragging, setDragging] = useState(false)
  useEffect(() => () => { if (animation.current !== null) cancelAnimationFrame(animation.current) }, [])
  function animate() {
    const alpha = .36 - smoothness * .0025
    current.current.x += (target.current.x - current.current.x) * alpha; current.current.y += (target.current.y - current.current.y) * alpha
    setPosition({x: current.current.x * radius.current, y: current.current.y * radius.current})
    const strength = Math.min(1, Math.hypot(current.current.x, current.current.y)), deadZone = .16 - (sensitivity - 50) * .0008, travel = Math.max(0, (strength - deadZone) / (1 - deadZone))
    if (travel === 0) { if (lastCommand.current.direction) { lastCommand.current = {direction: '', speed: 0, time: 0}; onStop() } }
    else { const nextSpeed = Math.max(1, Math.round(1 + Math.pow(travel, 1.9 - (sensitivity - 50) * .008) * (maxSpeed - 1))), direction = joystickDirection(current.current.x, current.current.y), now = performance.now(); if (direction !== lastCommand.current.direction || (nextSpeed !== lastCommand.current.speed && now - lastCommand.current.time >= 70)) { lastCommand.current = {direction, speed: nextSpeed, time: now}; onMove(direction, nextSpeed) } }
    animation.current = requestAnimationFrame(animate)
  }
  function update(event: PointerEvent<HTMLDivElement>) { if (!field.current) return; const bounds = field.current.getBoundingClientRect(); radius.current = Math.max(1, Math.min(bounds.width, bounds.height) / 2 - 25); const constrained = constrainJoystickVector(event.clientX - bounds.left - bounds.width / 2, event.clientY - bounds.top - bounds.height / 2, axisLock), distance = Math.hypot(constrained.x, constrained.y), scale = distance > radius.current ? radius.current / distance : 1; target.current = {x: constrained.x * scale / radius.current, y: constrained.y * scale / radius.current} }
  function release() { if (animation.current !== null) cancelAnimationFrame(animation.current); animation.current = null; target.current = {x: 0, y: 0}; current.current = {x: 0, y: 0}; setDragging(false); setPosition({x: 0, y: 0}); lastCommand.current = {direction: '', speed: 0, time: 0}; onStop() }
  return <div ref={field} className={`ptz-joystick ${dragging ? 'dragging' : ''}`} onPointerDown={event => { event.currentTarget.setPointerCapture(event.pointerId); setDragging(true); update(event); if (animation.current === null) animation.current = requestAnimationFrame(animate) }} onPointerMove={event => { if (event.currentTarget.hasPointerCapture(event.pointerId)) update(event) }} onPointerUp={release} onPointerCancel={release}><span className="axis horizontal" /><span className="axis vertical" /><span className="ring one" /><span className="ring two" /><span className="knob" style={{transform: `translate(${position.x}px, ${position.y}px)`}} /></div>
}
function joystickDirection(x: number, y: number) { const angle = Math.atan2(y, x) * 180 / Math.PI; if (angle >= -22.5 && angle < 22.5) return 'right'; if (angle < 67.5 && angle >= 22.5) return 'down-right'; if (angle < 112.5 && angle >= 67.5) return 'down'; if (angle < 157.5 && angle >= 112.5) return 'down-left'; if (angle >= 157.5 || angle < -157.5) return 'left'; if (angle < -112.5) return 'up-left'; if (angle < -67.5) return 'up'; return 'up-right' }

type IconName = 'arrow' | 'bookmark' | 'camera' | 'close' | 'plus' | 'record' | 'settings' | 'stop' | 'zoomIn' | 'zoomOut'
function Icon({name, rotation = 0}: {name: IconName; rotation?: number}) {
  const paths: Record<IconName, React.ReactNode> = {arrow: <><path d="M12 19V5"/><path d="m6 11 6-6 6 6"/></>, bookmark: <path d="M6 4h12v17l-6-4-6 4z"/>, camera: <><path d="M4 7h3l2-3h6l2 3h3v12H4z"/><circle cx="12" cy="13" r="4"/></>, close: <><path d="m6 6 12 12"/><path d="m18 6-12 12"/></>, plus: <><path d="M12 5v14"/><path d="M5 12h14"/></>, record: <circle cx="12" cy="12" r="6"/>, settings: <><circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1l2-1.5-2-3.5-2.4 1a8 8 0 0 0-1.7-1L14.5 3h-5L9 6a8 8 0 0 0-1.7 1L5 6 3 9.5 5.1 11a7 7 0 0 0 0 2L3 14.5 5 18l2.3-1a8 8 0 0 0 1.7 1l.5 3h5l.5-3a8 8 0 0 0 1.7-1l2.3 1 2-3.5-2.1-1.5a7 7 0 0 0 .1-1Z"/></>, stop: <rect x="7" y="7" width="10" height="10" rx="1"/>, zoomIn: <><circle cx="10.5" cy="10.5" r="6"/><path d="m15 15 5 5M10.5 7.5v6M7.5 10.5h6"/></>, zoomOut: <><circle cx="10.5" cy="10.5" r="6"/><path d="m15 15 5 5M7.5 10.5h6"/></>}
  return <svg className="ptz-icon" viewBox="0 0 24 24" aria-hidden="true" style={{transform: `rotate(${rotation}deg)`}}>{paths[name]}</svg>
}
