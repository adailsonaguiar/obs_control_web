import {PointerEvent, useMemo, useState} from 'react'
import {ConnectionSettings, OBSControlAPI} from '../api'

type Notice = {kind: 'success' | 'error'; text: string}

export function PTZPage() {
  const [server, setServer] = useState<ConnectionSettings>({host: '127.0.0.1', port: 3456, token: ''})
  const [cameraHost, setCameraHost] = useState('192.168.1.100')
  const [cameraPort, setCameraPort] = useState(52381)
  const [speed, setSpeed] = useState(8)
  const [notice, setNotice] = useState<Notice | null>(null)
  const client = useMemo(() => new OBSControlAPI(server), [server])

  async function send(kind: 'move' | 'zoom', direction: string) {
    setNotice(null)
    try {
      if (kind === 'move') await client.movePTZ(cameraHost, cameraPort, direction, speed)
      else await client.zoomPTZ(cameraHost, cameraPort, direction, Math.min(speed, 7))
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
        <article className="panel"><div className="panel-heading"><h2>Movimento</h2></div><div className="web-ptz-pad">
          <span /><button {...hold('move', 'up')} aria-label="Mover para cima">↑</button><span />
          <button {...hold('move', 'left')} aria-label="Mover para esquerda">←</button><button onClick={() => send('move', 'stop')} aria-label="Parar movimento">■</button><button {...hold('move', 'right')} aria-label="Mover para direita">→</button>
          <span /><button {...hold('move', 'down')} aria-label="Mover para baixo">↓</button><span />
        </div></article>
        <article className="panel"><div className="panel-heading"><h2>Zoom</h2></div><div className="web-ptz-zoom"><button {...hold('zoom', 'in')}>＋ Aproximar</button><button {...hold('zoom', 'out')}>− Afastar</button></div></article>
      </section>
      <p className="ptz-help">Segure para mover ou aplicar zoom e solte para parar. A câmera deve estar na mesma rede, com VISCA over IP habilitado. A porta padrão é 52381/UDP.</p>
    </main>
  </div>
}
