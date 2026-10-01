import { useEffect, useRef } from 'react'
import type { Emoji } from '../lib/emoji'
import { pointerMoved } from '../lib/pointer'

export const EMOJI_COLS = 12

interface Props {
  emojis: Emoji[]
  selected: number
  heading: string
  onHover(index: number): void
  onRun(index: number): void
}

export function EmojiGrid({ emojis, selected, heading, onHover, onRun }: Props): React.JSX.Element {
  const selectedRef = useRef<HTMLButtonElement | null>(null)
  useEffect(() => {
    selectedRef.current?.scrollIntoView({ block: 'nearest' })
  }, [selected, emojis])

  if (!emojis.length) {
    return <div className="grid h-full place-items-center text-[13px] text-muted">No emoji found</div>
  }
  return (
    <div className="scroll h-full overflow-y-auto px-3 pb-3">
      <div className="px-1 pb-2 pt-3 text-xs font-medium text-faint">{heading}</div>
      <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${EMOJI_COLS}, minmax(0, 1fr))` }} role="listbox">
        {emojis.map((emoji, i) => (
          <button
            key={`${i}-${emoji.char}`}
            ref={i === selected ? selectedRef : undefined}
            role="option"
            aria-selected={i === selected}
            aria-label={emoji.name}
            title={emoji.name}
            tabIndex={-1}
            onMouseMove={(e) => pointerMoved(e) && i !== selected && onHover(i)}
            onClick={() => onRun(i)}
            className={`grid aspect-square place-items-center rounded-lg text-[28px] leading-none transition-colors ${
              i === selected ? 'bg-active ring-2 ring-accent/70' : 'hover:bg-hover'
            }`}
          >
            {emoji.char}
          </button>
        ))}
      </div>
    </div>
  )
}
