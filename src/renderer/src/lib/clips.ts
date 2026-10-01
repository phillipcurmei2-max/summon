import { ArrowRight, Code, Copy, Hash, Link, Trash2, Type, XCircle } from 'lucide-react'
import type { ClipEntry } from '@shared/types'
import { parseColor } from './color'
import { timeAgo } from './duration'
import type { IconSpec, Item, Ops, Section } from './types'

export type ClipKind = 'link' | 'color' | 'number' | 'code' | 'text'

export function clipKind(text: string): ClipKind {
  const t = text.trim()
  if (/^https?:\/\/\S+$/i.test(t)) return 'link'
  if (t.length <= 40 && parseColor(t)) return 'color'
  if (/^[-+]?[\d,. ]+$/.test(t)) return 'number'
  if (/[{};]\s*$|^\s*(import|export|const|let|function|def|class|<\w+|#include|SELECT)\b/im.test(t) && t.includes('\n')) return 'code'
  return 'text'
}

function clipIcon(text: string, kind: ClipKind): IconSpec {
  switch (kind) {
    case 'link':
      return { kind: 'glyph', icon: Link, tint: 'blue' }
    case 'color':
      return { kind: 'swatch', color: parseColor(text.trim())!.hex }
    case 'number':
      return { kind: 'glyph', icon: Hash, tint: 'teal' }
    case 'code':
      return { kind: 'glyph', icon: Code, tint: 'violet' }
    default:
      return { kind: 'glyph', icon: Type, tint: 'gray' }
  }
}

export function clipTitle(text: string): string {
  const line = text.split(/\r?\n/).find((l) => l.trim()) ?? text
  const flat = line.replace(/\s+/g, ' ').trim()
  return flat.length > 140 ? flat.slice(0, 139) + '…' : flat
}

export function clipboardSections(entries: ClipEntry[], query: string, ops: Ops, now: number): Section[] {
  const tokens = query.trim().toLowerCase().split(/\s+/).filter(Boolean)
  const matches = tokens.length ? entries.filter((e) => tokens.every((t) => e.text.toLowerCase().includes(t))) : entries
  const items: Item[] = matches.map((entry) => ({
    key: entry.id,
    title: clipTitle(entry.text),
    accessory: timeAgo(entry.at, now),
    icon: clipIcon(entry.text, clipKind(entry.text)),
    score: 0,
    actions: [
      { id: 'paste', title: 'Paste to Active App', icon: ArrowRight, run: () => ops.paste(entry.text) },
      { id: 'copy', title: 'Copy to Clipboard', icon: Copy, run: () => ops.copy(entry.text) },
      {
        id: 'delete',
        title: 'Delete Entry',
        icon: Trash2,
        danger: true,
        shortcut: { key: 'Delete', ctrl: true },
        run: () => ops.deleteClip(entry.id)
      },
      {
        id: 'clear',
        title: 'Clear All History',
        icon: XCircle,
        danger: true,
        confirm: true,
        shortcut: { key: 'Delete', ctrl: true, shift: true },
        run: () => ops.clearClipboard()
      }
    ]
  }))
  if (!items.length) return []
  return [{ title: tokens.length ? `${items.length} match${items.length === 1 ? '' : 'es'}` : 'Recently copied', items }]
}
