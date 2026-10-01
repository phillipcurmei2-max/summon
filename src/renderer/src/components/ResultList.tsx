import { useEffect, useRef } from 'react'
import { ArrowRight } from 'lucide-react'
import { pointerMoved } from '../lib/pointer'
import type { Item, Section } from '../lib/types'
import { Highlight, ItemIcon } from './Icon'

interface Props {
  sections: Section[]
  selected: number
  confirmKey: string | null
  compact?: boolean
  onHover(index: number): void
  onRun(index: number): void
}

export function ResultList({ sections, selected, confirmKey, compact, onHover, onRun }: Props): React.JSX.Element {
  const selectedRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    selectedRef.current?.scrollIntoView({ block: 'nearest' })
  }, [selected, sections])

  let index = -1
  return (
    <div className="scroll h-full overflow-y-auto px-2 pb-2" role="listbox">
      {sections.map((section) => (
        <div key={section.title} role="group" aria-label={section.title}>
          <div className="px-3 pb-1 pt-3 text-xs font-medium text-faint">{section.title}</div>
          {section.items.map((item) => {
            index++
            const i = index
            const isSelected = i === selected
            const common = {
              ref: isSelected ? selectedRef : undefined,
              role: 'option',
              'aria-selected': isSelected,
              onMouseMove: (e: React.MouseEvent) => pointerMoved(e) && !isSelected && onHover(i),
              onClick: () => onRun(i)
            }
            if (item.answer) return <AnswerCard key={item.key} item={item} selected={isSelected} {...common} />
            return (
              <div
                key={item.key}
                {...common}
                className={`flex ${compact ? 'h-10' : 'h-11'} cursor-default items-center gap-3 rounded-lg px-3 ${
                  isSelected ? 'bg-active' : ''
                }`}
              >
                <ItemIcon icon={item.icon} />
                <div className="flex min-w-0 flex-1 items-baseline gap-2">
                  <span className="truncate text-[14px] text-fg">
                    <Highlight text={item.title} indices={item.highlight} />
                  </span>
                  {item.subtitle && <span className="truncate text-[13px] text-faint">{item.subtitle}</span>}
                </div>
                {confirmKey === item.key ? (
                  <span className="shrink-0 text-xs font-medium text-danger">Press ↵ again to confirm</span>
                ) : (
                  item.accessory && <span className="shrink-0 text-xs text-faint">{item.accessory}</span>
                )}
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}

type AnswerCardProps = {
  item: Item
  selected: boolean
  ref?: React.Ref<HTMLDivElement>
} & React.HTMLAttributes<HTMLDivElement>

function AnswerCard({ item, selected, ...rest }: AnswerCardProps): React.JSX.Element {
  const a = item.answer!
  return (
    <div
      {...rest}
      className={`mx-1 my-1 grid cursor-default grid-cols-[1fr_auto_1fr] items-center gap-4 rounded-xl border px-5 py-4 ${
        selected ? 'border-accent/60 bg-active' : 'border-line bg-hover'
      }`}
    >
      <div className="min-w-0 text-center">
        {a.swatch ? (
          <span className="checker mx-auto block h-9 w-20 overflow-hidden rounded-lg ring-1 ring-black/10 dark:ring-white/15">
            <span className="block h-full w-full" style={{ background: a.swatch }} />
          </span>
        ) : (
          <div className="selectable truncate font-display text-[22px] text-fg">{a.left}</div>
        )}
        <div className="mt-1 truncate text-xs text-faint">{a.swatch ? a.left : a.leftCaption}</div>
      </div>
      <ArrowRight size={18} className="text-faint" />
      <div className="min-w-0 text-center">
        <div className="selectable truncate font-display text-[22px] font-semibold text-fg">{a.right}</div>
        <div className="mt-1 truncate text-xs text-faint">{a.rightCaption}</div>
      </div>
    </div>
  )
}
