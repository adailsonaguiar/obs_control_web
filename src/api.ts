export type ConnectionSettings = {
  host: string
  port: number
  token: string
}

export type OBSStatus = {
  connected: boolean
  currentScene: string
  recording: boolean
  streaming: boolean
}

export type Scene = {name: string}
export type Source = {sceneName: string; name: string; id: number; enabled: boolean}
export type ServerEvent = {id: number; time: string; type: string; data?: unknown}

export class APIError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message)
    this.name = 'APIError'
  }
}

export function normalizeSettings(settings: ConnectionSettings): ConnectionSettings {
  let host = settings.host.trim().replace(/^https?:\/\//, '').replace(/\/+$/, '')
  if (!host) host = '127.0.0.1'
  const port = Number.isInteger(settings.port) && settings.port > 0 && settings.port <= 65535 ? settings.port : 3456
  return {host, port, token: settings.token.trim()}
}

export class OBSControlAPI {
  readonly settings: ConnectionSettings

  constructor(settings: ConnectionSettings) {
    this.settings = normalizeSettings(settings)
  }

  get baseURL() { return `http://${this.settings.host}:${this.settings.port}` }
  get eventsURL() { return `ws://${this.settings.host}:${this.settings.port}/events?token=${encodeURIComponent(this.settings.token)}` }

  health() { return this.request<{status: string; service: string}>('/health', {authenticated: false}) }
  status() { return this.request<OBSStatus>('/obs/status') }
  async scenes() { return (await this.request<{scenes: Scene[]}>('/obs/scenes')).scenes }
  async sources(sceneName: string) {
    const query = new URLSearchParams({sceneName})
    return (await this.request<{sources: Source[]}>(`/obs/sources?${query}`)).sources
  }
  setScene(sceneName: string) { return this.post('/obs/scene', {sceneName}) }
  setSourceVisible(sceneName: string, sourceName: string, visible: boolean) {
    return this.post(`/obs/source/${visible ? 'show' : 'hide'}`, {sceneName, sourceName})
  }
  setRecording(active: boolean) { return this.post(`/obs/recording/${active ? 'start' : 'stop'}`) }
  setStreaming(active: boolean) { return this.post(`/obs/stream/${active ? 'start' : 'stop'}`) }

  connectEvents(onEvent: (event: ServerEvent) => void, onState: (connected: boolean) => void) {
    const socket = new WebSocket(this.eventsURL)
    socket.addEventListener('open', () => onState(true))
    socket.addEventListener('close', () => onState(false))
    socket.addEventListener('error', () => onState(false))
    socket.addEventListener('message', message => {
      try { onEvent(JSON.parse(String(message.data)) as ServerEvent) } catch { /* ignore malformed messages */ }
    })
    return () => socket.close()
  }

  private post<T = {ok: boolean}>(path: string, body?: unknown) {
    return this.request<T>(path, {method: 'POST', body: body ? JSON.stringify(body) : undefined})
  }

  private async request<T>(path: string, options: RequestInit & {authenticated?: boolean} = {}): Promise<T> {
    const headers = new Headers(options.headers)
    if (options.authenticated !== false) headers.set('Authorization', `Bearer ${this.settings.token}`)
    if (options.body) headers.set('Content-Type', 'application/json')
    let response: Response
    try {
      response = await fetch(`${this.baseURL}${path}`, {...options, headers})
    } catch {
      throw new APIError('Não foi possível alcançar o servidor. Verifique IP, porta e acesso LAN.', 0)
    }
    const data = await response.json().catch(() => ({})) as {error?: string}
    if (!response.ok) throw new APIError(data.error || `Erro HTTP ${response.status}`, response.status)
    return data as T
  }
}
