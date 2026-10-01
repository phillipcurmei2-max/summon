import { ClipboardList } from 'lucide-react'
import type { ClipEntry } from '@shared/types'
import { clipKind } from '../lib/clips'
import { parseColor } from '../lib/color'
import { timeAgo } from '../lib/duration'
import type { Section } from '../lib/types'
import { ResultList } from './ResultList'

interface Props {
  sections: Section[]
  entries: ClipEntry[]
  selected: number
  confirmKey: string | null
  enabled: boolean
  now: number
  onHover(index: number): void
  onRun(index: number): void
}

export function ClipboardView({ sections, entries, selected, confirmKey, enabled, now, onHover, onRun }: Props): React.JSX.Element {
  const item = sections[0]?.items[selected]
  const entry = item ? entries.find((e) => e.id === item.key) : undefined

  if (!sections.length) {
    return (
      <div className="grid h-full place-items-center p-8 text-center">
        <div>
          <ClipboardList size={36} className="mx-auto text-faint" strokeWidth={1.5} />
          <div className="mt-3 text-[15px] font-medium text-fg">
            {entries.length ? 'No matches' : enabled ? 'Nothing copied yet' : 'Clipboard history is off'}
          </div>
          <div className="mt-1 text-[13px] text-muted">
            {entries.length
              ? 'Try a different word.'
              : enabled
                ? 'Copy some text anywhere and it will show up here.'
                : 'Turn it on in Summon Settings to keep a history of what you copy.'}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="grid h-full grid-cols-[minmax(0,42%)_1fr]">
      <div className="min-h-0 border-r border-line">
        <ResultList sections={sections} selected={selected} confirmKey={confirmKey} compact onHover={onHover} onRun={onRun} />
      </div>
      {entry && <Preview entry={entry} now={now} />}
    </div>
  )
}

function Preview({ entry, now }: { entry: ClipEntry; now: number }): React.JSX.Element {
  const kind = clipKind(entry.text)
  const color = kind === 'color' ? parseColor(entry.text.trim()) : null
  const words = entry.text.trim().split(/\s+/).filter(Boolean).length
  const lines = entry.text.split(/\r?\n/).length
  const shown = entry.text.length > 20_000 ? entry.text.slice(0, 20_000) + '\n…' : entry.text
  return (
    <div className="flex min-h-0 flex-col">
      <div className="scroll selectable min-h-0 flex-1 overflow-auto p-4">
        {color && (
          <div className="checker mb-3 h-24 overflow-hidden rounded-xl ring-1 ring-black/10 dark:ring-white/15">
            <div className="h-full w-full" style={{ background: color.hex }} />
          </div>
        )}
        <pre
          className={`whitespace-pre-wrap break-words text-[13px] leading-relaxed text-fg ${
            kind === 'code' ? 'font-mono text-[12px]' : 'font-sans'
          }`}
        >
          {shown}
        </pre>
      </div>
      <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 border-t border-line px-4 py-3 text-xs">
        <dt className="text-faint">Copied</dt>
        <dd className="text-right text-muted">{timeAgo(entry.at, now)}</dd>
        <dt className="text-faint">Characters</dt>
        <dd className="text-right text-muted">{entry.text.length.toLocaleString()}</dd>
        <dt className="text-faint">Words</dt>
        <dd className="text-right text-muted">{words.toLocaleString()}</dd>
        {lines > 1 && (
          <>
            <dt className="text-faint">Lines</dt>
            <dd className="text-right text-muted">{lines.toLocaleString()}</dd>
          </>
        )}
      </dl>
    </div>
  )
}
