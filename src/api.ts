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
export type CommandResult = {ok: boolean; commandId?: string; status?: 'confirmed' | 'failed'; confirmedAt?: string}
export type Telemetry = {streaming: boolean; streamDurationMs: number; streamBytes: number; streamCongestion: number; recording: boolean; recordDurationMs: number; recordBytes: number; cpuUsage: number; activeFps: number; averageFrameRenderTime: number; renderSkippedFrames: number; renderTotalFrames: number; outputSkippedFrames: number; outputTotalFrames: number}
export type AudioInput = {name: string; kind: string; muted: boolean; volumeDb: number; volumeMul: number; levelDb: number; levelStatus: string}
export type StudioMode = {enabled: boolean; programScene: string; previewScene: string; transitionName: string; transitionDuration: number}
export type DiagnosticLink = {id: string; label: string; state: 'healthy' | 'attention' | 'critical' | 'no-data'; lastSeen: string; message: string}
export type Diagnostics = {generatedAt: string; links: DiagnosticLink[]}
export type AuditEvent = {id: number; time: string; actor: string; action: string; commandId?: string; result: string}

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
  preview(sceneName: string, width = 640, quality = 50) {
    const query = new URLSearchParams({sceneName, width: String(width), quality: String(quality)})
    return this.requestBlob(`/obs/preview?${query}`)
  }
  setScene(sceneName: string) { return this.post('/obs/scene', {sceneName}) }
  setSourceVisible(sceneName: string, sourceName: string, visible: boolean) {
    return this.post(`/obs/source/${visible ? 'show' : 'hide'}`, {sceneName, sourceName})
  }
  setRecording(active: boolean, commandId: string) { return this.post<CommandResult>(`/obs/recording/${active ? 'start' : 'stop'}`, undefined, commandId) }
  setStreaming(active: boolean, commandId: string) { return this.post<CommandResult>(`/obs/stream/${active ? 'start' : 'stop'}`, undefined, commandId) }
  telemetry() { return this.request<Telemetry>('/api/v1/telemetry') }
  async audioInputs() { return (await this.request<{inputs: AudioInput[]}>('/api/v1/audio/inputs')).inputs }
  updateAudio(name: string, changes: {muted?: boolean; volumeDb?: number}, commandId: string) { return this.request<CommandResult>(`/api/v1/audio/inputs/${encodeURIComponent(name)}`, {method: 'PATCH', body: JSON.stringify(changes), headers: {'Idempotency-Key': commandId}}) }
  studioMode() { return this.request<StudioMode>('/api/v1/studio-mode') }
  setPreviewScene(sceneName: string, commandId: string) { return this.post<CommandResult>('/api/v1/studio-mode/preview', {sceneName}, commandId) }
  transition(duration: number, commandId: string) { return this.post<CommandResult>('/api/v1/transitions', {duration}, commandId) }
  diagnostics() { return this.request<Diagnostics>('/api/v1/diagnostics') }
  async auditEvents() { return (await this.request<{events: AuditEvent[]}>('/api/v1/audit-events')).events }

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

  private post<T = {ok: boolean}>(path: string, body?: unknown, commandId?: string) {
    return this.request<T>(path, {method: 'POST', body: body ? JSON.stringify(body) : undefined, headers: commandId ? {'Idempotency-Key': commandId} : undefined})
  }

  private async requestBlob(path: string): Promise<Blob> {
    let response: Response
    try {
      response = await fetch(`${this.baseURL}${path}`, {headers: {Authorization: `Bearer ${this.settings.token}`}})
    } catch {
      throw new APIError('Não foi possível carregar a prévia do OBS.', 0)
    }
    if (!response.ok) {
      const data = await response.json().catch(() => ({})) as {error?: string}
      throw new APIError(data.error || `Erro HTTP ${response.status}`, response.status)
    }
    return response.blob()
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
