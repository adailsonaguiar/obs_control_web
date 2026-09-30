import {PointerEvent, useEffect, useMemo, useRef, useState} from 'react'
import {ConnectionSettings, OBSControlAPI} from '../api'

type Notice = {kind: 'success' | 'error'; text: string}

export function PTZPage({mode}: {mode: 'arrows' | 'joystick'}) {
  const [server, setServer] = useState<ConnectionSettings>({host: '127.0.0.1', port: 3456, token: ''})
  const [cameraHost, setCameraHost] = useState('192.168.1.100')
  const [cameraPort, setCameraPort] = useState(52381)
  const [speed, setSpeed] = useState(8)
  const [sensitivity, setSensitivity] = useState(100)
  const [smoothness, setSmoothness] = useState(65)
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
    <header className="ptz-topbar"><a href="/">← Ferramentas</a><strong>{mode === 'arrows' ? 'PTZ por setas' : 'Joystick PTZ'}</strong><span>VISCA over IP</span></header>
    <main className="ptz-container">
      <div className="page-heading"><div><p>CONTROLE DE CÂMERA</p><h1>PTZ via rede local</h1></div><span className="obs-state online"><span /> UDP</span></div>
      <nav className="ptz-mode-nav" aria-label="Modo de controle PTZ">
        <a className={mode === 'arrows' ? 'active' : ''} href="/ptz/setas">Setas</a>
        <a className={mode === 'joystick' ? 'active' : ''} href="/ptz/joystick">Joystick virtual</a>
      </nav>
      {notice && <div className={`notice ${notice.kind}`}>{notice.text}<button onClick={() => setNotice(null)}>×</button></div>}
      <section className="panel ptz-config"><div className="panel-heading"><h2>Conexão</h2></div><div className="ptz-form">
        <label>IP do servidor<input value={server.host} onChange={event => setServer({...server, host: event.target.value})} /></label>
        <label>Porta do servidor<input type="number" min="1" max="65535" value={server.port} onChange={event => setServer({...server, port: Number(event.target.value)})} /></label>
        <label>Token da API<input type="password" value={server.token} onChange={event => setServer({...server, token: event.target.value})} /></label>
        <label>IP da câmera<input value={cameraHost} inputMode="decimal" onChange={event => setCameraHost(event.target.value)} /></label>
        <label>Porta VISCA UDP<input type="number" min="1" max="65535" value={cameraPort} onChange={event => setCameraPort(Number(event.target.value))} /></label>
        <label>{mode === 'arrows' ? 'Velocidade' : 'Velocidade máxima'} ({speed})<input type="range" min="1" max="24" value={speed} onChange={event => setSpeed(Number(event.target.value))} /></label>
      </div></section>
      <section className="ptz-control-grid">
        {mode === 'arrows' && <article className="panel ptz-control-card"><div className="panel-heading"><div><h2>Controle por setas</h2><p>Movimentos precisos em oito direções.</p></div></div><PTZDirectionPad hold={direction => hold('move', direction)} /></article>}
        {mode === 'joystick' && <article className="panel ptz-control-card"><div className="panel-heading"><div><h2>Joystick virtual</h2><p>Arraste para controlar direção e intensidade.</p></div></div><div className="joystick-tuning"><label>Sensibilidade ({sensitivity}%)<input type="range" min="50" max="150" value={sensitivity} onChange={event => setSensitivity(Number(event.target.value))} /></label><label>Suavidade ({smoothness}%)<input type="range" min="0" max="100" value={smoothness} onChange={event => setSmoothness(Number(event.target.value))} /></label></div><div className="web-joystick-wrap"><PTZJoystick maxSpeed={speed} sensitivity={sensitivity} smoothness={smoothness} onMove={(direction, nextSpeed) => send('move', direction, nextSpeed)} onStop={() => send('move', 'stop')} /></div></article>}
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

function PTZJoystick({maxSpeed, sensitivity, smoothness, onMove, onStop}: {maxSpeed: number; sensitivity: number; smoothness: number; onMove: (direction: string, speed: number) => void; onStop: () => void}) {
  const field = useRef<HTMLDivElement>(null)
  const lastCommand = useRef({direction: '', speed: 0, time: 0})
  const target = useRef({x: 0, y: 0})
  const current = useRef({x: 0, y: 0})
  const radius = useRef(1)
  const animation = useRef<number | null>(null)
  const [position, setPosition] = useState({x: 0, y: 0})
  const [dragging, setDragging] = useState(false)

  useEffect(() => () => { if (animation.current !== null) cancelAnimationFrame(animation.current) }, [])

  function animate() {
    const alpha = .36 - smoothness * .0025
    current.current.x += (target.current.x - current.current.x) * alpha
    current.current.y += (target.current.y - current.current.y) * alpha
    setPosition({x: current.current.x * radius.current, y: current.current.y * radius.current})

    const strength = Math.min(1, Math.hypot(current.current.x, current.current.y))
    const deadZone = .16 - (sensitivity - 50) * .0008
    const travel = Math.max(0, (strength - deadZone) / (1 - deadZone))
    if (travel === 0) {
      if (lastCommand.current.direction) { lastCommand.current = {direction: '', speed: 0, time: 0}; onStop() }
    } else {
      const responseCurve = 1.9 - (sensitivity - 50) * .008
      const nextSpeed = Math.max(1, Math.round(1 + Math.pow(travel, responseCurve) * (maxSpeed - 1)))
      const direction = joystickDirection(current.current.x, current.current.y)
      const now = performance.now()
      if (direction !== lastCommand.current.direction || (nextSpeed !== lastCommand.current.speed && now - lastCommand.current.time >= 70)) {
        lastCommand.current = {direction, speed: nextSpeed, time: now}
        onMove(direction, nextSpeed)
      }
    }
    animation.current = requestAnimationFrame(animate)
  }

  function update(event: PointerEvent<HTMLDivElement>) {
    if (!field.current) return
    const bounds = field.current.getBoundingClientRect()
    radius.current = Math.max(1, Math.min(bounds.width, bounds.height) / 2 - 25)
    const rawX = event.clientX - bounds.left - bounds.width / 2
    const rawY = event.clientY - bounds.top - bounds.height / 2
    const distance = Math.hypot(rawX, rawY)
    const scale = distance > radius.current ? radius.current / distance : 1
    target.current = {x: rawX * scale / radius.current, y: rawY * scale / radius.current}
  }

  function release() { if (animation.current !== null) cancelAnimationFrame(animation.current); animation.current = null; target.current = {x: 0, y: 0}; current.current = {x: 0, y: 0}; setDragging(false); setPosition({x: 0, y: 0}); lastCommand.current = {direction: '', speed: 0, time: 0}; onStop() }
  return <div ref={field} className={`web-joystick ${dragging ? 'dragging' : ''}`} onPointerDown={event => { event.currentTarget.setPointerCapture(event.pointerId); setDragging(true); update(event); if (animation.current === null) animation.current = requestAnimationFrame(animate) }} onPointerMove={event => { if (event.currentTarget.hasPointerCapture(event.pointerId)) update(event) }} onPointerUp={release} onPointerCancel={release}>
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
