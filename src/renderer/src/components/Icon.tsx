import type { IconSpec } from '../lib/types'

export function ItemIcon({ icon, size = 22 }: { icon: IconSpec; size?: number }): React.JSX.Element {
  const box = { width: size, height: size }
  switch (icon.kind) {
    case 'img':
      return <img src={icon.src} style={box} className="shrink-0 object-contain" draggable={false} alt="" />
    case 'glyph': {
      const Glyph = icon.icon
      return (
        <span style={box} className={`tint-${icon.tint} grid shrink-0 place-items-center rounded-[6px] text-white`}>
          <Glyph size={Math.round(size * 0.6)} strokeWidth={2.25} />
        </span>
      )
    }
    case 'letter':
      return (
        <span
          style={{ ...box, fontSize: size * 0.55 }}
          className={`tint-${icon.tint} grid shrink-0 place-items-center rounded-[6px] font-semibold text-white`}
        >
          {icon.letter}
        </span>
      )
    case 'emoji':
      return (
        <span style={{ ...box, fontSize: size * 0.85, lineHeight: 1 }} className="grid shrink-0 place-items-center">
          {icon.char}
        </span>
      )
    case 'swatch':
      return (
        <span style={box} className="checker shrink-0 overflow-hidden rounded-[6px] ring-1 ring-black/10 dark:ring-white/15">
          <span className="block h-full w-full" style={{ background: icon.color }} />
        </span>
      )
  }
}

export function Logo({ size = 20 }: { size?: number }): React.JSX.Element {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className="shrink-0">
      <defs>
        <linearGradient id="summon-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8f6bff" />
          <stop offset="0.55" stopColor="#d94fd0" />
          <stop offset="1" stopColor="#ff8a3d" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="22" height="22" rx="6.5" fill="url(#summon-g)" />
      <path
        d="M12 4.6c.55 3.9 2.9 6.25 6.8 6.8-3.9.55-6.25 2.9-6.8 6.8-.55-3.9-2.9-6.25-6.8-6.8 3.9-.55 6.25-2.9 6.8-6.8Z"
        fill="#fff"
      />
      <path
        d="M17.6 3.9c.2 1.2.9 1.9 2.1 2.1-1.2.2-1.9.9-2.1 2.1-.2-1.2-.9-1.9-2.1-2.1 1.2-.2 1.9-.9 2.1-2.1Z"
        fill="#fff"
        opacity=".85"
      />
    </svg>
  )
}

export function Kbd({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <kbd className="inline-grid h-5 min-w-5 place-items-center rounded-[5px] bg-active px-1.5 font-sans text-[11px] font-medium text-muted">
      {children}
    </kbd>
  )
}

export function Highlight({ text, indices }: { text: string; indices?: number[] }): React.JSX.Element {
  if (!indices?.length) return <>{text}</>
  const hits = new Set(indices)
  const parts: React.ReactNode[] = []
  let start = 0
  for (let i = 1; i <= text.length; i++) {
    if (i < text.length && hits.has(i) === hits.has(start)) continue
    const chunk = text.slice(start, i)
    parts.push(
      hits.has(start) ? (
        <span key={start} className="font-semibold text-accent">
          {chunk}
        </span>
      ) : (
        chunk
      )
    )
    start = i
  }
  return <>{parts}</>
}
