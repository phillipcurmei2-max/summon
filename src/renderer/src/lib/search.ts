import {
  ArrowRight,
  Copy,
  ExternalLink,
  FolderOpen,
  Globe,
  Link,
  Palette,
  Play,
  ShieldCheck,
  Sparkles,
  Timer,
  TimerOff,
  type LucideIcon
} from 'lucide-react'
import type { AppEntry, RecentFile, SearchEngine, TimerInfo, UsageStat } from '@shared/types'
import { calculate, rawNumber, formatNumber } from './calc'
import { parseColor } from './color'
import { COMMANDS, type CommandDef } from './commands'
import { formatClock, formatDuration, parseTimer } from './duration'
import { fuzzyMatch, matchAny } from './fuzzy'
import type { Action, IconSpec, Item, Ops, Section, Tint } from './types'
import { convertUnits } from './units'

export interface SearchInput {
  query: string
  apps: AppEntry[]
  recent: RecentFile[]
  usage: Record<string, UsageStat>
  timers: TimerInfo[]
  engine: SearchEngine
  now: number
  ops: Ops
}

const ENGINES: Record<SearchEngine, { name: string; url: string }> = {
  google: { name: 'Google', url: 'https://www.google.com/search?q=' },
  duckduckgo: { name: 'DuckDuckGo', url: 'https://duckduckgo.com/?q=' },
  bing: { name: 'Bing', url: 'https://www.bing.com/search?q=' }
}

interface WebProvider {
  keys: string[]
  name: string
  url: string
  icon: LucideIcon
  tint: Tint
}

// "yt lofi beats", "gh electron", "wiki octopus"…
const PREFIXES: WebProvider[] = [
  { keys: ['g', 'google'], name: 'Google', url: 'https://www.google.com/search?q=', icon: Globe, tint: 'blue' },
  { keys: ['yt', 'youtube'], name: 'YouTube', url: 'https://www.youtube.com/results?search_query=', icon: Play, tint: 'red' },
  { keys: ['gh', 'github'], name: 'GitHub', url: 'https://github.com/search?q=', icon: Globe, tint: 'gray' },
  { keys: ['wiki', 'w'], name: 'Wikipedia', url: 'https://en.wikipedia.org/w/index.php?search=', icon: Globe, tint: 'gray' },
  { keys: ['maps', 'map'], name: 'Google Maps', url: 'https://www.google.com/maps/search/', icon: Globe, tint: 'green' },
  { keys: ['r', 'reddit'], name: 'Reddit', url: 'https://www.reddit.com/search/?q=', icon: Globe, tint: 'orange' },
  { keys: ['ddg'], name: 'DuckDuckGo', url: 'https://duckduckgo.com/?q=', icon: Globe, tint: 'orange' },
  { keys: ['claude', 'ask', 'ai'], name: 'Claude', url: 'https://claude.ai/new?q=', icon: Sparkles, tint: 'orange' }
]

const URL_RE = /^(https?:\/\/)?(localhost|(\d{1,3}\.){3}\d{1,3}|([a-z0-9-]+\.)+[a-z]{2,})(:\d+)?(\/\S*)?$/i

const TINTS: Tint[] = ['violet', 'blue', 'green', 'orange', 'pink', 'teal', 'red', 'yellow']

export function letterIcon(name: string): IconSpec {
  let h = 0
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  return { kind: 'letter', letter: (name.match(/[\p{L}\p{N}]/u)?.[0] ?? '?').toUpperCase(), tint: TINTS[h % TINTS.length] }
}

function usageBoost(usage: Record<string, UsageStat>, id: string, now: number): number {
  const stat = usage[id]
  if (!stat) return 0
  const recency = now - stat.last < 3_600_000 ? 40 : now - stat.last < 86_400_000 ? 25 : now - stat.last < 7 * 86_400_000 ? 10 : 0
  return Math.min(45 * Math.log2(stat.count + 1), 220) + recency
}

export function shortPath(path: string): string {
  return path.replace(/^[a-z]:\\users\\[^\\]+/i, '~')
}

function dirOf(path: string): string {
  const i = path.lastIndexOf('\\')
  return i > 0 ? path.slice(0, i) : path
}

// ---------------------------------------------------------------------------
// Item builders
// ---------------------------------------------------------------------------

export function appItem(app: AppEntry, ops: Ops, score = 0, highlight?: number[]): Item {
  const actions: Action[] = [{ id: 'open', title: 'Open Application', icon: ArrowRight, run: () => ops.open({ type: 'app', app }, app.id) }]
  const file = app.exe ?? (app.kind === 'shortcut' ? app.target : undefined)
  if (file) {
    actions.push({
      id: 'admin',
      title: 'Run as Administrator',
      icon: ShieldCheck,
      run: () => {
        ops.recordUse(app.id)
        ops.runAsAdmin(app.kind === 'shortcut' ? app.target : file)
      }
    })
    actions.push({ id: 'reveal', title: 'Open File Location', icon: FolderOpen, shortcut: { key: 'o', ctrl: true }, run: () => ops.reveal(file) })
    actions.push({ id: 'copy-path', title: 'Copy Path', icon: Copy, shortcut: { key: 'c', ctrl: true, shift: true }, run: () => ops.copy(file) })
  }
  return {
    key: app.id,
    usageId: app.id,
    title: app.name,
    accessory: 'Application',
    icon: app.icon ? { kind: 'img', src: app.icon } : letterIcon(app.name),
    highlight,
    score,
    actions
  }
}

export function fileItem(file: RecentFile, ops: Ops, score = 0, highlight?: number[]): Item {
  return {
    key: file.id,
    usageId: file.id,
    title: file.name,
    subtitle: shortPath(dirOf(file.path)),
    accessory: file.isDir ? 'Folder' : 'Recent File',
    icon: file.icon ? { kind: 'img', src: file.icon } : letterIcon(file.name),
    highlight,
    score,
    actions: [
      { id: 'open', title: file.isDir ? 'Open Folder' : 'Open File', icon: ArrowRight, run: () => ops.open({ type: 'path', path: file.path }, file.id) },
      { id: 'reveal', title: 'Open File Location', icon: FolderOpen, shortcut: { key: 'o', ctrl: true }, run: () => ops.reveal(file.path) },
      { id: 'copy-path', title: 'Copy Path', icon: Copy, shortcut: { key: 'c', ctrl: true, shift: true }, run: () => ops.copy(file.path) }
    ]
  }
}

export function commandItem(cmd: CommandDef, ops: Ops, score = 0, highlight?: number[]): Item {
  return {
    key: cmd.id,
    usageId: cmd.id,
    title: cmd.title,
    subtitle: cmd.subtitle,
    accessory: 'Command',
    icon: { kind: 'glyph', icon: cmd.icon, tint: cmd.tint },
    highlight,
    score,
    actions: [{ id: 'run', title: cmd.confirm ? cmd.title : 'Run Command', icon: ArrowRight, confirm: cmd.confirm, danger: cmd.confirm, run: () => cmd.run(ops) }]
  }
}

function webItem(provider: { name: string; url: string; icon: LucideIcon; tint: Tint }, q: string, ops: Ops, score: number): Item {
  const url = provider.url + encodeURIComponent(q)
  const title = provider.name === 'Claude' ? `Ask Claude “${q}”` : `Search ${provider.name} for “${q}”`
  return {
    key: `web:${provider.name}`,
    title,
    accessory: 'Web',
    icon: { kind: 'glyph', icon: provider.icon, tint: provider.tint },
    score,
    actions: [
      { id: 'open', title: 'Open in Browser', icon: ExternalLink, run: () => ops.open({ type: 'url', url }) },
      { id: 'copy', title: 'Copy Link', icon: Copy, run: () => ops.copy(url) }
    ]
  }
}

function copyActions(ops: Ops, primary: string, label: string, extra: Action[] = []): Action[] {
  return [
    { id: 'copy', title: `Copy ${label}`, icon: Copy, run: () => ops.copy(primary) },
    { id: 'paste', title: `Paste ${label}`, icon: ArrowRight, run: () => ops.paste(primary) },
    ...extra
  ]
}

// ---------------------------------------------------------------------------
// Instant answers: maths, units, colours, timers
// ---------------------------------------------------------------------------

function answers(q: string, ops: Ops): Section[] {
  const sections: Section[] = []

  const timer = parseTimer(q)
  if (timer) {
    sections.push({
      title: 'Timer',
      items: [
        {
          key: 'answer:timer',
          title: `Start ${formatDuration(timer.ms)} timer`,
          icon: { kind: 'glyph', icon: Timer, tint: 'orange' },
          score: 5000,
          answer: {
            left: formatDuration(timer.ms),
            leftCaption: 'Timer',
            right: timer.label || 'Time’s up!',
            rightCaption: 'Notification',
          },
          actions: [{ id: 'start', title: 'Start Timer', icon: Timer, run: () => ops.startTimer(timer.ms, timer.label) }]
        }
      ]
    })
  }

  const calc = calculate(q)
  if (calc) {
    sections.push({
      title: 'Calculator',
      items: [
        {
          key: 'answer:calc',
          title: calc.text,
          icon: { kind: 'glyph', icon: Sparkles, tint: 'violet' },
          score: 5000,
          answer: { left: q.trim(), leftCaption: 'Expression', right: calc.text, rightCaption: 'Result' },
          actions: copyActions(ops, rawNumber(calc.value), 'Answer', [
            { id: 'copy-expr', title: 'Copy Expression', icon: Copy, run: () => ops.copy(`${q.trim()} = ${calc.text}`) }
          ])
        }
      ]
    })
  }

  const conversions = convertUnits(q)
  if (conversions.length) {
    sections.push({
      title: 'Conversion',
      items: conversions.map((c, i) => {
        const value = formatNumber(Number(c.value.toPrecision(6)))
        return {
          key: `answer:unit:${i}`,
          title: `${value} ${c.to}`,
          icon: { kind: 'glyph', icon: ArrowRight, tint: 'teal' },
          score: 5000 - i,
          answer: { left: `${formatNumber(c.input)} ${c.from}`, leftCaption: 'Convert', right: `${value} ${c.to}`, rightCaption: c.rate },
          actions: copyActions(ops, rawNumber(Number(c.value.toPrecision(8))), 'Result', [
            { id: 'copy-with-unit', title: 'Copy with Unit', icon: Copy, run: () => ops.copy(`${value} ${c.to}`) }
          ])
        }
      })
    })
  }

  const color = parseColor(q)
  if (color) {
    sections.push({
      title: 'Color',
      items: [
        {
          key: 'answer:color',
          title: color.hex,
          icon: { kind: 'swatch', color: color.hex },
          score: 5000,
          answer: { left: color.hex, leftCaption: 'HEX', right: color.rgb, rightCaption: color.hsl, swatch: color.hex },
          actions: [
            { id: 'hex', title: 'Copy HEX', icon: Palette, run: () => ops.copy(color.hex) },
            { id: 'rgb', title: 'Copy RGB', icon: Palette, run: () => ops.copy(color.rgb) },
            { id: 'hsl', title: 'Copy HSL', icon: Palette, run: () => ops.copy(color.hsl) }
          ]
        }
      ]
    })
  }
  return sections
}

function timerItems(timers: TimerInfo[], now: number, ops: Ops): Item[] {
  return timers.map((t) => ({
    key: `timer:${t.id}`,
    title: t.label || `${formatDuration(t.durationMs)} timer`,
    subtitle: `${formatClock(t.endsAt - now)} left`,
    accessory: 'Timer',
    icon: { kind: 'glyph', icon: Timer, tint: 'orange' },
    score: 0,
    actions: [{ id: 'cancel', title: 'Cancel Timer', icon: TimerOff, danger: true, run: () => ops.cancelTimer(t.id) }]
  }))
}

// ---------------------------------------------------------------------------
// Main search
// ---------------------------------------------------------------------------

export function search(input: SearchInput): Section[] {
  const { apps, recent, usage, timers, engine, now, ops } = input
  const q = input.query.trim()
  const appNames = new Set(apps.map((a) => a.name.toLowerCase()))
  // A built-in command is hidden if an installed app already has the same name.
  const commands = COMMANDS.filter((c) => !appNames.has(c.title.toLowerCase()))

  if (!q) return emptyState(input, commands)

  const sections = answers(q, ops)
  const results: Item[] = []

  // "yt cats" style prefix searches jump straight to the top.
  const prefix = /^(\S+)\s+(.+)$/.exec(q)
  const provider = prefix && PREFIXES.find((p) => p.keys.includes(prefix[1].toLowerCase()))
  if (provider && prefix) results.push(webItem(provider, prefix[2], ops, 3000))

  if (URL_RE.test(q) && !q.includes(' ')) {
    const url = /^https?:\/\//i.test(q) ? q : `https://${q}`
    results.push({
      key: 'url',
      title: `Open ${q}`,
      accessory: 'Link',
      icon: { kind: 'glyph', icon: Link, tint: 'blue' },
      score: 2500,
      actions: [
        { id: 'open', title: 'Open in Browser', icon: ExternalLink, run: () => ops.open({ type: 'url', url }) },
        { id: 'copy', title: 'Copy Link', icon: Copy, run: () => ops.copy(url) }
      ]
    })
  }

  for (const app of apps) {
    const m = fuzzyMatch(q, app.name)
    if (m) results.push(appItem(app, ops, m.score + usageBoost(usage, app.id, now), m.indices))
  }
  for (const cmd of commands) {
    const m = matchAny(q, cmd.title, cmd.keywords)
    if (m) results.push(commandItem(cmd, ops, m.score - 10 + usageBoost(usage, cmd.id, now), m.indices))
  }
  if (q.length >= 2) {
    for (const file of recent) {
      const m = fuzzyMatch(q, file.name)
      if (m && m.score >= 300) results.push(fileItem(file, ops, m.score - 60 + usageBoost(usage, file.id, now), m.indices))
    }
  }
  if (timers.length && /^(timers?|countdown)/i.test(q)) results.push(...timerItems(timers, now, ops).map((i) => ({ ...i, score: 1500 })))

  results.sort((a, b) => b.score - a.score)
  if (results.length) sections.push({ title: 'Results', items: results.slice(0, 40) })

  const fallback = [webItem({ ...ENGINES[engine], icon: Globe, tint: 'blue' }, q, ops, 0)]
  fallback.push(webItem(PREFIXES.find((p) => p.name === 'Claude')!, q, ops, 0))
  sections.push({ title: `Use “${q.length > 28 ? q.slice(0, 27) + '…' : q}” with…`, items: fallback })
  return sections
}

function emptyState(input: SearchInput, commands: CommandDef[]): Section[] {
  const { apps, recent, usage, timers, now, ops } = input
  const sections: Section[] = []
  if (timers.length) sections.push({ title: 'Timers', items: timerItems(timers, now, ops) })

  // Suggestions = what you use most, weighted towards recently.
  const candidates: Item[] = [
    ...apps.filter((a) => usage[a.id]).map((a) => appItem(a, ops)),
    ...commands.filter((c) => usage[c.id]).map((c) => commandItem(c, ops)),
    ...recent.filter((f) => usage[f.id]).map((f) => fileItem(f, ops))
  ]
  for (const item of candidates) item.score = usageBoost(usage, item.usageId!, now)
  candidates.sort((a, b) => b.score - a.score)
  const suggestions = candidates.slice(0, 5)
  if (suggestions.length) sections.push({ title: 'Suggestions', items: suggestions })

  const shown = new Set(suggestions.map((s) => s.key))
  const featured = commands.filter((c) => c.featured && !shown.has(c.id)).map((c) => commandItem(c, ops))
  sections.push({ title: 'Commands', items: featured })

  const recentFiles = recent.filter((f) => !shown.has(f.id)).slice(0, 4).map((f) => fileItem(f, ops))
  if (recentFiles.length) sections.push({ title: 'Recent Files', items: recentFiles })
  return sections
}
