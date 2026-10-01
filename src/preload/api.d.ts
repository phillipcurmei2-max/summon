import type {
  BootState,
  Catalog,
  ClipEntry,
  OpenTarget,
  Settings,
  ShowReason,
  TimerInfo,
  UsageStat
} from '@shared/types'

type Unsubscribe = () => void

export interface SummonApi {
  boot(): Promise<BootState>
  open(target: OpenTarget, usageId?: string): Promise<{ ok: boolean; error?: string }>
  hide(): void
  recordUse(id: string): void
  copy(text: string): Promise<void>
  /** Copies, hides, then presses Ctrl+V in the previous app (when auto-paste is on). */
  paste(text: string): Promise<'pasted' | 'copied'>
  setSettings(patch: Partial<Settings>): Promise<{ settings: Settings; hotkeyOk: boolean }>
  suspendHotkey(suspended: boolean): Promise<void>
  deleteClip(id: string): void
  clearClipboard(): void
  startTimer(ms: number, label: string): Promise<TimerInfo>
  cancelTimer(id: string): void
  reveal(path: string): void
  runAsAdmin(path: string): void
  reindex(): void
  quit(): void
  onShow(cb: (reason: ShowReason, view?: 'clipboard' | 'settings') => void): Unsubscribe
  onHidden(cb: () => void): Unsubscribe
  onCatalog(cb: (catalog: Catalog) => void): Unsubscribe
  onClipboard(cb: (entries: ClipEntry[]) => void): Unsubscribe
  onUsage(cb: (usage: Record<string, UsageStat>) => void): Unsubscribe
  onTimers(cb: (timers: TimerInfo[]) => void): Unsubscribe
  onSettings(cb: (settings: Settings) => void): Unsubscribe
  onTheme(cb: (dark: boolean) => void): Unsubscribe
}

declare global {
  interface Window {
    summon: SummonApi
  }
}
