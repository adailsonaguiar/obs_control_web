import {AudioInput, Diagnostics, OBSStatus, Scene, Source, StudioMode, Telemetry} from '../api'

export type Notice = {kind: 'success' | 'error' | 'info'; text: string}
export type DashboardData = {status: OBSStatus; scenes: Scene[]; sources: Source[]; telemetry: Telemetry | null; audio: AudioInput[]; studio: StudioMode | null; diagnostics: Diagnostics | null}
export type RunAction = (name: string, operation: () => Promise<unknown>, message: string) => Promise<void>
export type DashboardProps = {
  address: string
  data: DashboardData
  eventOnline: boolean
  busy: string
  notice: Notice | null
  dismissNotice: () => void
  disconnect: () => void
  runAction: RunAction
  setScene: (sceneName: string) => Promise<unknown>
  setSourceVisible: (sceneName: string, sourceName: string, visible: boolean) => Promise<unknown>
  setRecording: (active: boolean, commandId: string) => Promise<unknown>
  setStreaming: (active: boolean, commandId: string) => Promise<unknown>
  setAudio: (name: string, changes: {muted?: boolean; volumeDb?: number}, commandId: string) => Promise<unknown>
  setPreviewScene: (sceneName: string, commandId: string) => Promise<unknown>
  transition: (duration: number, commandId: string) => Promise<unknown>
  refreshDiagnostics: () => Promise<void>
  fetchPreview: (sceneName: string, width?: number, quality?: number) => Promise<Blob>
}
