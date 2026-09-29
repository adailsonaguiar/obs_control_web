import {OBSStatus, Scene, ServerEvent, Source} from '../api'

export type Notice = {kind: 'success' | 'error' | 'info'; text: string}
export type DashboardData = {status: OBSStatus; scenes: Scene[]; sources: Source[]}
export type RunAction = (name: string, operation: () => Promise<unknown>, message: string) => Promise<void>
export type DashboardProps = {
  address: string
  data: DashboardData
  events: ServerEvent[]
  eventOnline: boolean
  busy: string
  notice: Notice | null
  dismissNotice: () => void
  disconnect: () => void
  runAction: RunAction
  setScene: (sceneName: string) => Promise<unknown>
  setSourceVisible: (sceneName: string, sourceName: string, visible: boolean) => Promise<unknown>
  setRecording: (active: boolean) => Promise<unknown>
  setStreaming: (active: boolean) => Promise<unknown>
}
