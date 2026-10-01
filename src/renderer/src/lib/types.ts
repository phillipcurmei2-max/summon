import type { LucideIcon } from 'lucide-react'
import type { OpenTarget } from '@shared/types'

export type Tint = 'violet' | 'blue' | 'green' | 'orange' | 'red' | 'pink' | 'gray' | 'teal' | 'yellow'

export type IconSpec =
  | { kind: 'img'; src: string }
  | { kind: 'glyph'; icon: LucideIcon; tint: Tint }
  | { kind: 'letter'; letter: string; tint: Tint }
  | { kind: 'emoji'; char: string }
  | { kind: 'swatch'; color: string }

export interface Shortcut {
  key: string
  ctrl?: boolean
  shift?: boolean
}

export interface Action {
  id: string
  title: string
  icon?: LucideIcon
  shortcut?: Shortcut
  danger?: boolean
  /** Destructive commands (restart, empty bin…) need a second Enter. */
  confirm?: boolean
  run: () => void
}

export interface Answer {
  left: string
  leftCaption: string
  right: string
  rightCaption: string
  swatch?: string
}

export interface Item {
  key: string
  /** Key used for learning what you pick most often. */
  usageId?: string
  title: string
  subtitle?: string
  accessory?: string
  icon: IconSpec
  highlight?: number[]
  score: number
  /** actions[0] runs on Enter, actions[1] on Ctrl+Enter; the rest live in the Ctrl+K panel. */
  actions: Action[]
  answer?: Answer
}

export interface Section {
  title: string
  items: Item[]
}

export type Mode = 'root' | 'clipboard' | 'emoji' | 'settings'

/** Everything a result can do — implemented by App, passed into search. */
export interface Ops {
  open(target: OpenTarget, usageId?: string): void
  copy(text: string): void
  paste(text: string): void
  reveal(path: string): void
  runAsAdmin(path: string): void
  setMode(mode: Mode): void
  setQuery(query: string): void
  startTimer(ms: number, label: string): void
  cancelTimer(id: string): void
  recordUse(id: string): void
  deleteClip(id: string): void
  clearClipboard(): void
  reindex(): void
  quit(): void
}
