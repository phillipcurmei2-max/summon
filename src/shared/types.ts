/** Types shared by the main process, the preload bridge and the renderer. */

export type SearchEngine = 'google' | 'duckduckgo' | 'bing'
export type ThemePref = 'system' | 'dark' | 'light'

export interface Settings {
  /** Electron accelerator, e.g. "Alt+Space". */
  hotkey: string
  launchAtLogin: boolean
  clipboardHistory: boolean
  /** After picking a clipboard entry, paste it straight into the app you were using. */
  autoPaste: boolean
  searchEngine: SearchEngine
  theme: ThemePref
}

export const DEFAULT_SETTINGS: Settings = {
  hotkey: 'Alt+Space',
  launchAtLogin: true,
  clipboardHistory: true,
  autoPaste: true,
  searchEngine: 'google',
  theme: 'system'
}

export interface AppEntry {
  /** Stable id used for ranking, e.g. "app:c:\...\chrome.lnk" or "app:uwp:Microsoft.WindowsCalculator_8wekyb3d8bbwe!App". */
  id: string
  name: string
  /** Shortcut path, or the AppUserModelID for apps that only exist in Start (Store apps etc). */
  target: string
  kind: 'shortcut' | 'uwp'
  /** Start's AppUserModelID, when Start lists the app. */
  appId?: string
  /** Resolved executable, when known — used for "Open file location" and "Run as administrator". */
  exe?: string
  icon?: string
}

export interface RecentFile {
  id: string
  name: string
  path: string
  isDir: boolean
  icon?: string
}

export interface ClipEntry {
  id: string
  text: string
  /** Epoch ms when it was copied. */
  at: number
}

export interface UsageStat {
  count: number
  last: number
}

export interface Catalog {
  apps: AppEntry[]
  recent: RecentFile[]
  indexing: boolean
}

export interface TimerInfo {
  id: string
  label: string
  endsAt: number
  durationMs: number
}

export interface BootState {
  version: string
  settings: Settings
  hotkeyOk: boolean
  firstRun: boolean
  catalog: Catalog
  clipboard: ClipEntry[]
  usage: Record<string, UsageStat>
  timers: TimerInfo[]
  dark: boolean
}

export type SystemCommandId =
  | 'lock'
  | 'sleep'
  | 'restart'
  | 'shutdown'
  | 'signout'
  | 'recycle-bin'
  | 'empty-recycle-bin'
  | 'settings'
  | 'task-manager'
  | 'control-panel'
  | 'explorer'
  | 'downloads'
  | 'documents'
  | 'desktop'
  | 'screenshot'
  | 'toggle-dark-mode'

export type OpenTarget =
  | { type: 'app'; app: AppEntry }
  | { type: 'path'; path: string }
  | { type: 'url'; url: string }
  | { type: 'system'; command: SystemCommandId }

export type ShowReason = 'hotkey' | 'tray' | 'second-instance' | 'first-run' | 'settings'
