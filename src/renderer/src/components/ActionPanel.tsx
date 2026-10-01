import { useEffect, useRef } from 'react'
import { pointerMoved } from '../lib/pointer'
import type { Action, Shortcut } from '../lib/types'
import { Kbd } from './Icon'

export function shortcutLabel(s: Shortcut): string[] {
  const keys: string[] = []
  if (s.ctrl) keys.push('Ctrl')
  if (s.shift) keys.push('Shift')
  keys.push(s.key === 'Enter' ? '↵' : s.key.length === 1 ? s.key.toUpperCase() : s.key)
  return keys
}

/** Enter runs the first action, Ctrl+Enter the second; others use their own shortcut. */
export function actionKeys(action: Action, index: number): string[] {
  if (index === 0) return ['↵']
  if (index === 1) return ['Ctrl', '↵']
  return action.shortcut ? shortcutLabel(action.shortcut) : []
}

interface Props {
  title: string
  actions: Action[]
  selected: number
  /** Id of a destructive action waiting for a second press. */
  confirmId: string | null
  onHover(index: number): void
  onRun(index: number): void
}

export function ActionPanel({ title, actions, selected, confirmId, onHover, onRun }: Props): React.JSX.Element {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    ref.current?.animate(
      [
        { opacity: 0, transform: 'translateY(6px) scale(.98)' },
        { opacity: 1, transform: 'none' }
      ],
      { duration: 120, easing: 'cubic-bezier(.2,.8,.2,1)' }
    )
  }, [])
  return (
    <div
      ref={ref}
      role="menu"
      className="absolute bottom-12 right-3 z-20 w-80 rounded-xl border border-line bg-raised p-1.5 shadow-2xl shadow-black/30"
    >
      <div className="truncate px-2.5 pb-1.5 pt-1 text-xs font-medium text-faint">{title}</div>
      {actions.map((action, i) => {
        const Icon = action.icon
        return (
          <div
            key={action.id}
            role="menuitem"
            onMouseMove={(e) => pointerMoved(e) && i !== selected && onHover(i)}
            onClick={() => onRun(i)}
            className={`flex h-9 cursor-default items-center gap-2.5 rounded-lg px-2.5 text-[13px] ${
              i === selected ? 'bg-active' : ''
            } ${action.danger ? 'text-danger' : 'text-fg'}`}
          >
            {Icon && <Icon size={15} className={action.danger ? '' : 'text-muted'} />}
            <span className="flex-1 truncate">{action.title}</span>
            {confirmId === action.id ? (
              <span className="text-xs font-medium">Press again to confirm</span>
            ) : (
              <span className="flex gap-1">
                {actionKeys(action, i).map((k) => (
                  <Kbd key={k}>{k}</Kbd>
                ))}
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}
