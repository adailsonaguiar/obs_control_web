import {FormEvent, memo} from 'react'
import {ConnectionSettings} from '../api'
import {ContactFooter} from './ContactFooter'
import {Notice} from './types'

type Props = {
  draft: ConnectionSettings
  setDraft: (value: ConnectionSettings) => void
  remember: boolean
  setRemember: (value: boolean) => void
  connecting: boolean
  notice: Notice | null
  onSubmit: (event: FormEvent) => void
}

function ConnectionScreenComponent({draft, setDraft, remember, setRemember, connecting, notice, onSubmit}: Props) {
  return <main className="connect-page"><section className="connect-card"><div className="connect-brand"><span className="logo large"><img src="/logo.png" alt="" /></span><div><p>OBS Remote Deck</p><h1>Controle remoto</h1></div></div><p className="connect-copy">Conecte ao servidor que está rodando no computador do OBS. Os dois dispositivos precisam estar na mesma rede.</p>
    {notice && <div className={`notice ${notice.kind}`}>{notice.text}</div>}
    <form onSubmit={onSubmit}><div className="address-row"><label>IP do computador<input autoFocus required value={draft.host} placeholder="192.168.1.20" onChange={event => setDraft({...draft, host: event.target.value})} /></label><label className="port">Porta<input required type="number" min="1" max="65535" value={draft.port} onChange={event => setDraft({...draft, port: Number(event.target.value)})} /></label></div><label>Token da API<input required type="password" value={draft.token} placeholder="Cole o token exibido no servidor" onChange={event => setDraft({...draft, token: event.target.value})} /></label><label className="remember"><input type="checkbox" checked={remember} onChange={event => setRemember(event.target.checked)} /><span>Lembrar o token neste dispositivo</span></label><button className="connect-button" disabled={connecting}>{connecting ? 'Conectando…' : 'Conectar ao servidor'}</button></form>
    <div className="connect-download"><div><strong>Precisa do aplicativo servidor?</strong><span>Instale-o no computador onde o OBS está aberto.</span></div><a href="https://github.com/adailsonaguiar/obs_control_server/releases" target="_blank" rel="noreferrer">Baixar servidor ↗</a></div>
    <div className="connect-help"><strong>Antes de conectar</strong><ol><li>Abra o servidor e conecte-o ao WebSocket do OBS.</li><li>Ative “Permitir acesso pela rede local”, salve e reinicie.</li><li>Use o IP local do computador, a porta e o token exibidos.</li></ol><a className="setup-help-link" href="/#instalacao">Ver instruções completas</a></div>
  </section><ContactFooter /></main>
}

export const ConnectionScreen = memo(ConnectionScreenComponent)
