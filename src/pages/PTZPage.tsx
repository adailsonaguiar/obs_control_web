import {PointerEvent, useMemo, useRef, useState} from 'react'
import {ConnectionSettings, OBSControlAPI} from '../api'

type Notice = {kind: 'success' | 'error'; text: string}

export function PTZPage() {
  const [server, setServer] = useState<ConnectionSettings>({host: '127.0.0.1', port: 3456, token: ''})
  const [cameraHost, setCameraHost] = useState('192.168.1.100')
  const [cameraPort, setCameraPort] = useState(52381)
  const [speed, setSpeed] = useState(8)
  const [notice, setNotice] = useState<Notice | null>(null)
  const client = useMemo(() => new OBSControlAPI(server), [server])

  async function send(kind: 'move' | 'zoom', direction: string, speedOverride?: number) {
    setNotice(null)
    try {
      const commandSpeed = speedOverride ?? speed
      if (kind === 'move') await client.movePTZ(cameraHost, cameraPort, direction, commandSpeed)
      else await client.zoomPTZ(cameraHost, cameraPort, direction, Math.min(commandSpeed, 7))
    } catch (error) {
      setNotice({kind: 'error', text: error instanceof Error ? error.message : String(error)})
    }
  }

  function hold(kind: 'move' | 'zoom', direction: string) {
    return {
      onPointerDown: (event: PointerEvent<HTMLButtonElement>) => { event.currentTarget.setPointerCapture(event.pointerId); void send(kind, direction) },
      onPointerUp: () => void send(kind, 'stop'),
      onPointerCancel: () => void send(kind, 'stop'),
    }
  }

  return <div className="ptz-page">
    <header className="ptz-topbar"><a href="/">← Ferramentas</a><strong>Controle PTZ</strong><span>VISCA over IP</span></header>
    <main className="ptz-container">
      <div className="page-heading"><div><p>CONTROLE DE CÂMERA</p><h1>PTZ via rede local</h1></div><span className="obs-state online"><span /> UDP</span></div>
      {notice && <div className={`notice ${notice.kind}`}>{notice.text}<button onClick={() => setNotice(null)}>×</button></div>}
      <section className="panel ptz-config"><div className="panel-heading"><h2>Conexão</h2></div><div className="ptz-form">
        <label>IP do servidor<input value={server.host} onChange={event => setServer({...server, host: event.target.value})} /></label>
        <label>Porta do servidor<input type="number" min="1" max="65535" value={server.port} onChange={event => setServer({...server, port: Number(event.target.value)})} /></label>
        <label>Token da API<input type="password" value={server.token} onChange={event => setServer({...server, token: event.target.value})} /></label>
        <label>IP da câmera<input value={cameraHost} inputMode="decimal" onChange={event => setCameraHost(event.target.value)} /></label>
        <label>Porta VISCA UDP<input type="number" min="1" max="65535" value={cameraPort} onChange={event => setCameraPort(Number(event.target.value))} /></label>
        <label>Velocidade ({speed})<input type="range" min="1" max="24" value={speed} onChange={event => setSpeed(Number(event.target.value))} /></label>
      </div></section>
      <section className="ptz-control-grid">
        <article className="panel ptz-control-card"><div className="panel-heading"><div><h2>Controle por setas</h2><p>Movimentos precisos em oito direções.</p></div></div><PTZDirectionPad hold={direction => hold('move', direction)} /></article>
        <article className="panel ptz-control-card"><div className="panel-heading"><div><h2>Joystick virtual</h2><p>Arraste para controlar direção e intensidade.</p></div></div><div className="web-joystick-wrap"><PTZJoystick onMove={(direction, nextSpeed) => send('move', direction, nextSpeed)} onStop={() => send('move', 'stop')} /></div></article>
        <article className="panel ptz-control-card ptz-zoom-card"><div className="panel-heading"><div><h2>Zoom</h2><p>Aproxime ou afaste enquanto pressiona.</p></div></div><div className="web-ptz-zoom"><button {...hold('zoom', 'in')}>＋ Aproximar</button><button {...hold('zoom', 'out')}>− Afastar</button></div></article>
      </section>
      <p className="ptz-help">Segure para mover ou aplicar zoom e solte para parar. A câmera deve estar na mesma rede, com VISCA over IP habilitado. A porta padrão é 52381/UDP.</p>
    </main>
  </div>
}

const directions = [
  {direction: 'up-left', label: '↖', name: 'Mover para cima e esquerda'},
  {direction: 'up', label: '↑', name: 'Mover para cima'},
  {direction: 'up-right', label: '↗', name: 'Mover para cima e direita'},
  {direction: 'left', label: '←', name: 'Mover para esquerda'},
  {direction: 'stop', label: '■', name: 'Parar movimento'},
  {direction: 'right', label: '→', name: 'Mover para direita'},
  {direction: 'down-left', label: '↙', name: 'Mover para baixo e esquerda'},
  {direction: 'down', label: '↓', name: 'Mover para baixo'},
  {direction: 'down-right', label: '↘', name: 'Mover para baixo e direita'},
]

function PTZDirectionPad({hold}: {hold: (direction: string) => HoldHandlers}) {
  return <div className="web-ptz-pad" aria-label="Controle direcional">
    {directions.map(({direction, label, name}) => <button key={direction} type="button" className={direction === 'stop' ? 'stop' : ''} aria-label={name} title={name} {...hold(direction)}>{label}</button>)}
  </div>
}

type HoldHandlers = {
  onPointerDown: (event: PointerEvent<HTMLButtonElement>) => void
  onPointerUp: () => void
  onPointerCancel: () => void
}

function PTZJoystick({onMove, onStop}: {onMove: (direction: string, speed: number) => void; onStop: () => void}) {
  const field = useRef<HTMLDivElement>(null)
  const lastCommand = useRef({direction: '', speed: 0, time: 0})
  const [position, setPosition] = useState({x: 0, y: 0})
  const [dragging, setDragging] = useState(false)

  function update(event: PointerEvent<HTMLDivElement>) {
    if (!field.current) return
    const bounds = field.current.getBoundingClientRect()
    const radius = Math.max(1, Math.min(bounds.width, bounds.height) / 2 - 25)
    const rawX = event.clientX - bounds.left - bounds.width / 2
    const rawY = event.clientY - bounds.top - bounds.height / 2
    const distance = Math.hypot(rawX, rawY)
    const scale = distance > radius ? radius / distance : 1
    const x = rawX * scale
    const y = rawY * scale
    setPosition({x, y})
    const strength = Math.min(1, Math.hypot(x, y) / radius)
    if (strength < .12) {
      if (lastCommand.current.direction) { lastCommand.current = {direction: '', speed: 0, time: 0}; onStop() }
      return
    }
    const direction = joystickDirection(x, y)
    const nextSpeed = Math.max(1, Math.round(strength * 24))
    const now = Date.now()
    if (direction !== lastCommand.current.direction || Math.abs(nextSpeed - lastCommand.current.speed) >= 2 || now - lastCommand.current.time >= 100) {
      lastCommand.current = {direction, speed: nextSpeed, time: now}
      onMove(direction, nextSpeed)
    }
  }

  function release() { setDragging(false); setPosition({x: 0, y: 0}); lastCommand.current = {direction: '', speed: 0, time: 0}; onStop() }
  return <div ref={field} className={`web-joystick ${dragging ? 'dragging' : ''}`} onPointerDown={event => { event.currentTarget.setPointerCapture(event.pointerId); setDragging(true); update(event) }} onPointerMove={event => { if (event.currentTarget.hasPointerCapture(event.pointerId)) update(event) }} onPointerUp={release} onPointerCancel={release}>
    <span className="joystick-axis horizontal" /><span className="joystick-axis vertical" /><span className="joystick-knob" style={{transform: `translate(${position.x}px, ${position.y}px)`}} />
  </div>
}

function joystickDirection(x: number, y: number) {
  const angle = Math.atan2(y, x) * 180 / Math.PI
  if (angle >= -22.5 && angle < 22.5) return 'right'
  if (angle >= 22.5 && angle < 67.5) return 'down-right'
  if (angle >= 67.5 && angle < 112.5) return 'down'
  if (angle >= 112.5 && angle < 157.5) return 'down-left'
  if (angle >= 157.5 || angle < -157.5) return 'left'
  if (angle >= -157.5 && angle < -112.5) return 'up-left'
  if (angle >= -112.5 && angle < -67.5) return 'up'
  return 'up-right'
}
